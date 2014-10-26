MyTodoApp = {
    models: {},
    views: {},
    collections: {}
};

MyTodoApp.models.TodoItem = Backbone.Model.extend({
    toggleStatus: function(){
        console.log("[Model] toggleStatus")
        if (this.get('status') === 'incomplete'){
            this.set('status', 'complete');
        }
        else{
            this.set('status', 'incomplete');
        }
        console.log("[Model] ToggledStatus is: ", this.get())
    }
});

MyTodoApp.collections.TodoItemCollection = Backbone.Collection.extend({
    model:MyTodoApp.models.TodoItem,
    localStorage: new Backbone.LocalStorage("TodoListItems"),
    initialize: function(){
        console.log("[Collection] initialize")
        this.on('remove', this.hide);
        this.on('add', this.saveList);
    },
    hide: function(model){
        console.log("[Collection] deleting model")
        model.destroy();
    },
    saveList: function(model){
        console.log("[Collection] deleting model")
        model.save();
    }
});

MyTodoApp.views.TodoViewCollection = Backbone.View.extend({
    tagName: "div",
    id: "app",

    initialize: function() {
        console.log("[ViewColl] initialize", this.el);
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.addAll, this);
    },
    addOne: function(todoitem){
        console.log("[ViewColl] Inside addOne, adding: ", todoitem.toJSON())
        var todoview = new MyTodoApp.views.TodoView({model: todoitem});
        this.$el.append(todoview.render());
        console.log("[ViewColl] Inside addOne, collection html is: ", this.el)
        return this.el
    },

    addAll: function(){
        console.log("[ViewColl] addAll", this.el)
        this.collection.forEach(this.addOne, this)
        console.log("[ViewColl] addAll collection html is: ", this.el)
        return this.el
    },

    render: function(){
        this.addAll();
        return this.el;
    }
});

MyTodoApp.views.TodoView = Backbone.View.extend({
    tagName: "li",
    initialize: function(){
        console.log("[ItemView] initialize")
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    template: _.template('<h3 class="<%= status %>"><input type=checkbox ' + '<% if(status === "complete") print("checked") %>/>' + ' <%= description %></h3><a href="todos/<%= id %>" id="todos/<%= id %>" class="todo" >more</a> '),



    render: function(){
        console.log("[ItemView] render");
        console.log("[ItemView] Item is: ", this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));
        console.log("[ItemView] item html is: ", this.el);
        return this.el;
    },

    events:{
        'click h3': 'toggleStatus',
        'click .todo': 'showMore'
    },

    showMore: function(event){
        event.preventDefault();
        console.log("[ItemView] Event :show more of item" , event);
        MyTodoApp.TodoRouter.navigate(event.target.id, {trigger: true})
    },

    remove:function(){
        console.log("[ItemView] Event: Remove item");
        this.$el.remove();
    },

    toggleStatus: function(){
        console.log("[ItemView] Event: Toggle status");
        this.model.toggleStatus();
    }
});


MyTodoApp.TodoRouter = new (Backbone.Router.extend({
    routes: {"":"index", "todos/:id": "showItem"},

    index: function(){
        console.log("[Router] Index")
        MyTodoApp.views.MainView.todoviewcollection.render();
    },
    showItem: function(id){
        console.log("[Router] show one item");
        var model = MyTodoApp.views.MainView.todoitemcollection.get(id);
        var todoview = new MyTodoApp.views.TodoView({model: model});
        MyTodoApp.views.MainView.todoviewcollection.$el.html(todoview.render());
    }
}));

MyTodoApp.views.MainView = new (Backbone.View.extend({
    el: document.body,

    template: _.template('<h1> My Todo List </h1>'),

    render: function(){
        console.log("[Main View] Rendering");
        this.$el.html(this.template());
        console.log("[Main View] html is: ", this.el);
    },

    start: function(){
        console.log("[Main View] Starting. Initial app html is: ", this.el)
        /*this.test = [
            {description:"clean bedroom", status:"incomplete"},
            {description:"reply to sis", status:"incomplete"}
        ];*/
        this.todoitemcollection = new MyTodoApp.collections.TodoItemCollection();
        this.todoviewcollection = new MyTodoApp.views.TodoViewCollection({collection: this.todoitemcollection});
        this.$el.append(this.todoviewcollection.render());
        console.log("[Main View] At start attached html is :", this.todoviewcollection.el);
        this.todoitemcollection.fetch();
        Backbone.history.start({pushState:true});
    }
}));

$(function(){
    MyTodoApp.views.MainView.render();
    MyTodoApp.views.MainView.start();
});