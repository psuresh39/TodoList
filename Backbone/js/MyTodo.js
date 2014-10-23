$(document).ready(function(){
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
    var todoitem = new TodoItem();

    var TodoView = Backbone.View.extend({

        initialize: function(){
            this.model.on('change', this.render, this);
        },

        template: _.template('<h3 class="<%= status %>">' + '<% if(status === "complete") print("checked") %>/>' + ' <%= description %></h3>'),

        render: function(){
            console.log(this.model.toJSON());
            this.$el.html(this.template(this.model.toJSON()));
            console.log(this.el);
        },

        events:{
            'click h3': 'toggleStatus'
        },

        toggleStatus: function(){
            this.model.toggleStatus();
            this.$el.render();
        },
    });

    var todoview = new TodoView({model: todoitem});
    todoview.render();
});