MyTodoApp = {
    models: {},
    views: {},
    collections: {}
}

MyTodoApp.models.TodoItem = Backbone.Model.extend({
    defaults: {status: 'incomplete', description: 'Empty task'},
    toggleStatus: function(){
        if (this.get('status') === 'incomplete'){
            this.set('status', 'complete');
        }
        else{
            this.set('status', 'incomplete');
        }
    }
});

MyTodoApp.collections.TodoItemCollection = Backbone.Collection.extend({
    model:TodoItem,
    initialize: function(){
        this.on('remove', this.hide);
    },
    hide: function(model){
        model.destroy();
    }
});

MyTodoApp.views.TodoViewCollection = Backbone.View.extend({
    el: $('#app'),
    initialize: function() {
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.render, this);
    },
    addOne: function(todoitem){
        var todoview = new TodoView({model: todoitem});
        this.$el.append(todoview.render());
        console.log(this.el);
    },

    render: function(){
        console.log("inside collection view");
        this.collection.forEach(this.addOne, this)
    }
});

MyTodoApp.views.TodoView = Backbone.View.extend({
    tagName: "li",
    initialize: function(){
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    template: _.template('<h3 class="<%= status %>"><input type=checkbox ' + '<% if(status === "complete") print("checked") %>/>' + ' <%= description %></h3>&nbsp&nbsp&nbsp<a href="/todos/<%= id %>" >more</a> '),



    render: function(){
        console.log("inside model view");
        console.log(this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));
        console.log(this.el);
        return this.el;
    },

    events:{
        'click h3': 'toggleStatus',
        'click .todo': 'showMore'
    },

    showMore: function(model){
        model.preventDefault();
        console.log(model);
        console.log("show more on this item")

    },

    remove:function(){
      this.$el.remove();
    },

    toggleStatus: function(){
        this.model.toggleStatus();
    }
});


MyTodoApp.TodoRouter = new (Backbone.Router.extend({
    routes: {"":"index", "todos/:id": "showItem"},
    initialize: function(){
        this.todoitemcollection = new MyTodoApp.collections.TodoItemCollection({});
        this.todoviewcollection = new MyTodoApp.views.TodoViewCollection({collection: this.todoitemcollection});
        this.test = [
            {description:"clean bedroom", status:"incomplete", id:1},
            {description:"reply to sis", status:"incomplete", id:2}
        ];
        this.todoitemcollection.reset(this.test);
    },
    start: function(){
        Backbone.history.start({pushState:true});
    },
    index: function(){
        console.log("In index;")
        this.todoitemcollection.reset(this.test);
    },
    showItem: function(id){
        console.log("In showItem");
        var model = this.todoitemcollection.get(id);
        var todoview = new TodoView({model: model});
        this.todoviewcollection.$el.html(todoview.render());
    }
}));

$(function(){
    MyTodoApp.TodoRouter.start();
});