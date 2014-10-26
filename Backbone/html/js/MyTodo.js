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
    localStorage: new Backbone.LocalStorage("TodosList-test2"),
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
        console.log("[Collection] Adding model")
        model.save();
    }
});

MyTodoApp.views.TodoViewCollection = Backbone.View.extend({

    initialize: function() {
        console.log("[ViewColl] initialize", this.el);
        //this.collection.on('add', this.addOne, this);
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
        this.$el.empty();
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

    template: _.template('<h3 class="<%= status %>"><input type=checkbox ' + '<% if(status === "complete") print("checked") %>/>' + ' <%= description %></h3><a href="todos/<%= id %>" id="todos/<%= id %>" class="todo" >more</a> &nbsp&nbsp <a href="editItem/<%= id %>" id="editItem/<%= id %>" class="edittodo" >edit</a> '),



    render: function(){
        console.log("[ItemView] render");
        console.log("[ItemView] Item is: ", this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));
        console.log("[ItemView] item html is: ", this.el);
        return this.el;
    },

    events:{
        'click h3': 'toggleStatus',
        'click .todo': 'showMore',
        'click .edittodo': 'editTodo'
    },

    showMore: function(event){
        event.preventDefault();
        console.log("[ItemView] Event :show more of item" , event);
        MyTodoApp.TodoRouter.navigate(event.target.id, {trigger: true})
    },

    editTodo: function(event){
        event.preventDefault();
        console.log("[EditTodo] Event : edit item" , event);
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

MyTodoApp.views.NewTodoForm = Backbone.View.extend({

    template: _.template('<form>' + '<input name=description value="<%= description %>" />' + '<button>Save</button></form>'),

    render: function(){
        console.log("[FormView] Rendering form");
        this.$el.html(this.template(this.model.attributes));
        return this.el;
    },

    events: {
        submit: 'save'
    },

    save: function(e){
        e.preventDefault();
        console.log("[Save] saving model and trigger todos.html")
        var desc = this.$('input[name=description]').val();
        if (this.model.has('id')){
            console.log("[Save] Existing model, just save")
            this.model.set('description', desc);
        }
        else {
            console.log("[Save] New model, add to collection")
            var todoitem = new MyTodoApp.models.TodoItem({description:desc, status:"incomplete"})
            MyTodoApp.views.MainView.todoitemcollection.add(todoitem);
        }
        MyTodoApp.TodoRouter.navigate("todos.html", {trigger: true});
    }
});


MyTodoApp.TodoRouter = new (Backbone.Router.extend({
    routes: {
        "todos.html":"index",
        "todos/:id": "showItem",
        "addTodoItem": "addTodoItem",
        "editItem/:id": "editItem"
    },

    index: function(){
        console.log("[Router] Index")
        MyTodoApp.views.MainView.mainContainer.$el.html(MyTodoApp.views.MainView.todoviewcollection.render());
    },
    showItem: function(id){
        console.log("[Router] show one item");
        var model = MyTodoApp.views.MainView.todoitemcollection.get(id);
        var todoview = new MyTodoApp.views.TodoView({model: model});
        MyTodoApp.views.MainView.mainContainer.$el.html(todoview.render());
    },
    addTodoItem: function(){
        //render new empty form
        console.log("[addTodoItem] Inside route Handler")
        var todoitem = new MyTodoApp.models.TodoItem({description: "What do you have in mind ?"})
        var newForm = new MyTodoApp.views.NewTodoForm({model: todoitem});
        MyTodoApp.views.MainView.mainContainer.$el.html(newForm.render());
    },
    editItem: function(id){
        console.log("[EditItem] edit one item");
        var model = MyTodoApp.views.MainView.todoitemcollection.get(id);
        var newForm = new MyTodoApp.views.NewTodoForm({model: model});
        MyTodoApp.views.MainView.mainContainer.$el.html(newForm.render());
    }
}));

MyTodoApp.views.MainAppContainer = Backbone.View.extend({
    tagName: "div",
    id: "app",

    render: function(){
        return this.el;
    }
});

MyTodoApp.views.MainView = new (Backbone.View.extend({
    el: document.body,

    template: _.template('<h1> My Todo List </h1> <br><br><br> <a href="addTodoItem" id="addTodoItem" class="addtodo" >Add Item</a> <br> '),

    render: function(){
        console.log("[Main View] Rendering");
        this.$el.html(this.template());
        console.log("[Main View] html is: ", this.el);
    },

    events: {
        'click a': "addNewItem"
    },

    addNewItem: function(event){
        event.preventDefault();
        console.log("[addNewItem Handler] triggering route");
        MyTodoApp.TodoRouter.navigate(event.target.id, {trigger:true});
    },

    start: function(){
        console.log("[Main View] Starting. Initial app html is: ", this.el)
        /*this.test = [
            {description:"clean bedroom", status:"incomplete"},
            {description:"reply to sis", status:"incomplete"}
        ];*/
        this.todoitemcollection = new MyTodoApp.collections.TodoItemCollection();
        this.todoviewcollection = new MyTodoApp.views.TodoViewCollection({collection: this.todoitemcollection});
        this.mainContainer = new MyTodoApp.views.MainAppContainer({});
        this.$el.append(this.mainContainer.render());
        console.log("[Main View] At start attached html is :", this.todoviewcollection.el);
        this.todoitemcollection.fetch();
        Backbone.history.start({pushState:true});
    }
}));

$(function(){
    MyTodoApp.views.MainView.render();
    MyTodoApp.views.MainView.start();
});
