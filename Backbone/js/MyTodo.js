
var TodoItem = Backbone.Model.extend({
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

var TodoItemCollection = Backbone.Collection.extend({
    model:TodoItem,
    initialize: function(){
        this.on('remove', this.hide);
    },
    hide: function(model){
        model.destroy();
    }
});

var TodoViewCollection = Backbone.View.extend({
    el: $('body'),
    initialize: function() {
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.render, this);
    },
    addOne: function(todoitem){
        var todoview = new TodoView({model: todoitem});
        this.$el.append(todoview.render());
    },

    render: function(){
        console.log("inside collection view")
        this.collection.forEach(this.addOne, this)
    }
});

var TodoView = Backbone.View.extend({
    tagName: "li",
    initialize: function(){
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    template: _.template('<h3 class="<%= status %>"><input type=checkbox ' + '<% if(status === "complete") print("checked") %>/>' + ' <%= description %></h3>'),



    render: function(){
        console.log("inside model view");
        console.log(this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));
        console.log(this.el);
        return this.el;
    },

    events:{
        'click h3': 'toggleStatus'
    },

    remove:function(){
      this.$el.remove();
    },

    toggleStatus: function(){
        this.model.toggleStatus();
    }
});

var todoitemcollection = new TodoItemCollection({});
var todoviewcollection = new TodoViewCollection({collection: todoitemcollection});
todoviewcollection.render();
console.log(todoviewcollection.el);


var test = [
    {description:"clean bedroom", status:"incomplete"},
    {description:"reply to sis", status:"incomplete"},
    {description:"gym signup", status:"incomplete"}
]
todoitemcollection.reset(test);