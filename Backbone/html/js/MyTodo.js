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

MyTodoApp.collections.TodoItemCollection = Backbone.Firebase.Collection.extend({
    model:MyTodoApp.models.TodoItem,
    firebase: new Firebase("https://somecrawl.firebaseio.com/questions"),
    initialize: function(){
        console.log("[Collection] initialize")
        //this.on('remove', this.hide);
        //this.on('add', this.saveList);
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
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.render, this);
        this.collection.on('all', this.render, this);
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

    template: _.template('<h3 class="<%= status %>"> <%= description %></h3><a href="todos/<%= id %>" id="todos/<%= id %>" class="todo" >more</a> &nbsp&nbsp <a href="editItem/<%= id %>" id="editItem/<%= id %>" class="edittodo" >edit</a>&nbsp&nbsp<a href="deleteItem/<%= id %>" id="<%= id %>" class="deletetodo" >delete</a> '),



    render: function(){
        console.log("[ItemView] render");
        console.log("[ItemView] Item is: ", this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));
        console.log("[ItemView] item html is: ", this.el);
        return this.el;
    },

    render_with_answers: function(){
        this.$el.empty();
        this.render();
        this.$el.prepend('<a href="addAnswerItem/"'+this.model.id+ ' id="addAnswerItem/"'+this.model.id+ ' class="answer" >Add Answer</a> <br>');
        //Add existing answers
        console.log("HEREEEEEEE");
        var answerList = new MyTodoApp.collections.TodoItemCollection({firebase: new Firebase("https://somecrawl.firebaseio.com/answers/"+this.model.id)});
        console.log("Also HEREEEEEEEE!!!!");
        this.$el.append(answerList.render());
        return this.el;
    },

    events:{
        'click h3': 'toggleStatus',
        'click .todo': 'showMore',
        'click .edittodo': 'editTodo',
        'click .deletetodo': 'deleteTodo',
        'click .answer': 'addAnswer'
    },

    addAnswer: function(event){
        event.preventDefault();
        console.log("[ItemView] Event :show more of item" , event);
        MyTodoApp.TodoRouter.navigate(event.target.id, {trigger: true})
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

    deleteTodo: function(event){
        event.preventDefault();
        console.log("[DeleteTodo] Event : delete item" , event);
        var model = MyTodoApp.views.MainView.todoitemcollection.get(event.target.id);
        MyTodoApp.views.MainView.todoitemcollection.remove(model);
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

    template: _.template('<form>' + '<input name=description value="<%= description %>" />' + '<button class="question">Save</button></form>'),

    answer_template: _.template('<form>' + '<input name=description value="<%= description %>" />' + '<button class="answer">Save</button></form>'),

    render: function(){
        console.log("[FormView] Rendering form");
        this.$el.html(this.template(this.model.attributes));
        return this.el;
    },

    render_answer: function(id){
        this.question_id = id;
        this.render();
    },

    events: {
        'click .question': 'save',
        'click .answer': 'save_answer'
    },


    generate_id: function (){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    },

    save: function(e){
        e.preventDefault();
        console.log("[Save] saving model and trigger todos.html")
        var desc = this.$('input[name=description]').val();
        if (this.model.has('id')){
            console.log("[Save] Existing model, just save")
            this.model.set('description', desc);
            //this.model.save();
        }
        else {
            console.log("[Save] New model, add to collection")
            var todoitem = new MyTodoApp.models.TodoItem({description:desc, id:this.generate_id()})
            MyTodoApp.views.MainView.todoitemcollection.add(todoitem);
        }
        MyTodoApp.TodoRouter.navigate("todos.html", {trigger: true});
    },

    save_answer: function(e){
        e.preventDefault();
        console.log("[Save] saving model and trigger todos.html")
        var desc = this.$('input[name=description]').val();
        if (this.model.has('id')){
            console.log("[Save] Existing model, just save")
            this.model.set('description', desc);
            //this.model.save();
        }
        else {
            console.log("[Save] New model, add to collection")
            var todoitem = new MyTodoApp.models.TodoItem({description:desc, id:this.generate_id()})
            var itemCollection = new MyTodoApp.collections.TodoItemCollection({firebase: new Firebase("https://somecrawl.firebaseio.com/answers/"+this.question_id)});
            itemCollection.add(todoitem);
        }
        MyTodoApp.TodoRouter.navigate("todos/"+this.question_id, {trigger: true});
    }
});


MyTodoApp.TodoRouter = new (Backbone.Router.extend({
    routes: {
        "todos.html":"index",
        "todos/:id": "showItem",
        "addTodoItem": "addTodoItem",
        "editItem/:id": "editItem",
        "addAnswerItem/:id": "addAnswer"
    },

    index: function(){
        console.log("[Router] Index")
        MyTodoApp.views.MainView.mainContainer.$el.html(MyTodoApp.views.MainView.todoviewcollection.render());
        MyTodoApp.views.MainView.mainContainer.$el.prepend('<a href="addTodoItem" id="addTodoItem" class="addtodo" >Add Question</a> <br>');
    },
    showItem: function(id){
        console.log("[Router] show one item");
        var model = MyTodoApp.views.MainView.todoitemcollection.get(id);
        var todoview = new MyTodoApp.views.TodoView({model: model});
        MyTodoApp.views.MainView.mainContainer.$el.html(todoview.render_with_answers());
    },
    addTodoItem: function(){
        //render new empty form
        console.log("[addTodoItem] Inside route Handler")
        var todoitem = new MyTodoApp.models.TodoItem({description: "What do you have in mind ?"})
        var newForm = new MyTodoApp.views.NewTodoForm({model: todoitem});
        MyTodoApp.views.MainView.mainContainer.$el.html(newForm.render());
        MyTodoApp.views.MainView.mainContainer.$el.prepend('Add Question <br>');
    },

    addAnswer: function(id){
        var todoitem = new MyTodoApp.models.TodoItem({description: "the answer is..."})
        var newForm = new MyTodoApp.views.NewTodoForm({model: todoitem});
        MyTodoApp.views.MainView.mainContainer.$el.html(newForm.render_answer(id));
    },

    editItem: function(id){
        console.log("[EditItem] edit one item");
        var model = MyTodoApp.views.MainView.todoitemcollection.get(id);
        var newForm = new MyTodoApp.views.NewTodoForm({model: model});
        MyTodoApp.views.MainView.mainContainer.$el.html(newForm.render());
        MyTodoApp.views.MainView.mainContainer.$el.prepend('Edit Question <br>');
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

    template: _.template('<h1> Your Q&A Feed </h1> <br><br><br> '),

    render: function(){
        console.log("[Main View] Rendering");
        this.$el.html(this.template());
        console.log("[Main View] html is: ", this.el);
    },

    events: {
        'click a': "addNewItem",
        'click .answer': "addNewAnswer"
    },

    addNewItem: function(event){
        event.preventDefault();
        console.log("[addNewItem Handler] triggering route");
        MyTodoApp.TodoRouter.navigate(event.target.id, {trigger:true});
    },

    addNewAnswer: function(event){
        event.preventDefault();
        console.log("[addNewAnswer Handler] triggering route");
        MyTodoApp.TodoRouter.navigate(event.target.id, {trigger:true});
    },

    start: function(){
        console.log("[Main View] Starting. Initial app html is: ", this.el)
        /*this.test = [
            {description:"clean bedroom", status:"incomplete"},
            {description:"reply to sis", status:"incomplete"}
        ];*/
        this.todoitemcollection = new MyTodoApp.collections.TodoItemCollection();
        console.log("[Main View] Collection created");
        this.todoviewcollection = new MyTodoApp.views.TodoViewCollection({collection: this.todoitemcollection});
        this.mainContainer = new MyTodoApp.views.MainAppContainer({});
        this.$el.append(this.mainContainer.render());
        console.log("[Main View] At start attached html is :", this.todoviewcollection.el);
        //setInterval(this.todoitemcollection.fetch.bind(this.todoitemcollection), 10000);
        Backbone.history.start({pushState:true});
    }
}));

$(function(){
    MyTodoApp.views.MainView.render();
    MyTodoApp.views.MainView.start();
});
