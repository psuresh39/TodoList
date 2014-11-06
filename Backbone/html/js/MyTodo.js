MyQuestionAnswerApp = {
    models: {},
    views: {},
    collections: {}
};

MyQuestionAnswerApp.models.Post = Backbone.Model.extend({
    defaults: {
        commentCount: 0,
        viewCount: 0,
        answerCount: 0,
        voteCount: 0,
        body: "",
        title: "",
    }
});

MyQuestionAnswerApp.collections.PostCollection = Backbone.Firebase.Collection.extend({
    model:MyQuestionAnswerApp.models.Post,
    firebase: new Firebase("https://somecrawl.firebaseio.com/questions"),
});

MyQuestionAnswerApp.views.PostCollectionView = Backbone.View.extend({

    initialize: function() {
        console.log("[PostCollectionView] initialize");
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.render, this);
        this.collection.on('all', this.render, this);
    },
    addOne: function(postitem){
        console.log("[PostCollectionView] Inside addOne, adding: ", postitem.toJSON());
        var postview = new MyQuestionAnswerApp.views.PostView({model: postitem});
        this.$el.append(postview.render());
        console.log("[PostCollectionView] Inside addOne, collection html is: ", this.el);
        return this.el;
    },

    addAll: function(){
        console.log("[PostCollectionView] addAll", this.el);
        this.collection.forEach(this.addOne, this);
        console.log("[PostCollectionView] addAll collection html is: ", this.el);
        return this.el;
    },

    render: function(){
        console.log("[PostCollectionView] rendering");
        this.$el.empty();
        this.addAll();
        return this.el;
    }
});

MyQuestionAnswerApp.views.PostView = Backbone.View.extend({
    tagName: "li",
    initialize: function(){
        console.log("[PostView] initialize");
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    template: _.template('<h3> <%= description %></h3><a href="post/<%= id %>" id="post/<%= id %>" class="post" >more</a> &nbsp&nbsp <a href="editpost/<%= id %>" id="editpost/<%= id %>" class="editpost" >edit</a>&nbsp&nbsp<a href="deletepost/<%= id %>" id="<%= id %>" class="deletepost" >delete</a> '),



    render: function(){
        console.log("[PostView] render");
        console.log("[PostView] Post is: ", this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));
        console.log("[PostView] Post html is: ", this.el);
        return this.el;
    },

    render_with_answers: function(){
        console.log("[PostView] render_with_answers");
        this.$el.empty();
        this.render();
        console.log("[PostView] Render Answers for Question id: ", this.model.id);
        this.$el.prepend('<a href="addAnswer/'+this.model.id+ '" id="addAnswer/'+this.model.id+ '" class="answer" >Add Answer</a> <br>');
        var answerList = new (Backbone.Firebase.Collection.extend({
            firebase: new Firebase("https://somecrawl.firebaseio.com/answers/"+this.model.id), 
            model:MyQuestionAnswerApp.models.Post
        }));
        var answerListView = new MyQuestionAnswerApp.views.PostCollectionView({collection: answerList});
        this.$el.append(answerListView.render());
        return this.el;
    },

    events:{
        'click .post': 'showPost',
        'click .editpost': 'editPost',
        'click .deletepost': 'deletePost',
        'click .answer': 'addAnswer'
    },

    addAnswer: function(event){
        event.preventDefault();
        console.log("[PostView addAnswer] Click Event :show more of item" , event);
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger: true});
    },

    showPost: function(event){
        event.preventDefault();
        console.log("[PostView showPost] Click Event :show more of item" , event);
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger: true});
    },

    editPost: function(event){
        event.preventDefault();
        console.log("[PostView EditPost] Click Event : edit item" , event);
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger: true});
    },

    deletePost: function(event){
        event.preventDefault();
        console.log("[PostView DeletePost] Click Event : delete item" , event);
        var model = MyQuestionAnswerApp.views.MainView.QuestionsCollection.get(event.target.id);
        MyQuestionAnswerApp.views.MainView.QuestionsCollection.remove(model);
    },

    remove:function(){
        console.log("[PostView remove] Event: Remove item");
        this.$el.remove();
    },

});

MyQuestionAnswerApp.views.PostEditForm = Backbone.View.extend({

    template: _.template('<form>' + '<input name=description value="<%= description %>" />' + '<button class="question">Save</button></form>'),

    answer_template: _.template('<form>' + '<input name=description value="<%= description %>" />' + '<button class="answer">Save</button></form>'),

    render: function(){
        console.log("[PostEditForm] Rendering form");
        this.$el.html(this.template(this.model.attributes));
        return this.el;
    },

    render_answer: function(id){
        console.log("[PostEditForm] inside render_answer");
        this.question_id = id;
        this.$el.html(this.answer_template(this.model.attributes));
        return this.el;
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
        console.log("[Save Click handler] saving model and trigger Q&Afeed.html")
        var desc = this.$('input[name=description]').val();
        if (this.model.has('id')){
            console.log("[Save Click handler] Existing model, just save")
            this.model.set('description', desc);
            //this.model.save();
        }
        else {
            console.log("[Save Click Handler] New model, add to collection");
            var question = new MyQuestionAnswerApp.models.Post({description:desc, id:this.generate_id()});
            MyQuestionAnswerApp.views.MainView.QuestionsCollection.add(question);
        }
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate("Q&Afeed.html", {trigger: true});
    },

    save_answer: function(e){
        e.preventDefault();
        console.log("[Save ANS Click handler] saving model and trigger questions details page");
        var desc = this.$('input[name=description]').val();
        if (this.model.has('id')){
            console.log("[Save ANS Click handler] Existing model, just save");
            this.model.set('description', desc);
        }
        else {
            console.log("[Save ANS Click handler] New model, add to collection", this.question_id);
            var answer = new MyQuestionAnswerApp.models.Post({description:desc, id:this.generate_id()});
            var answerCollection = new (Backbone.Firebase.Collection.extend({
                firebase: new Firebase("https://somecrawl.firebaseio.com/answers/"+this.question_id),
                model:MyQuestionAnswerApp.models.Post
            }));
            answerCollection.add(answer);
        }
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate("post/"+this.question_id, {trigger: true});
    }
});


MyQuestionAnswerApp.QuestionAnswerAppRouter = new (Backbone.Router.extend({
    routes: {
        "Q&Afeed.html":"index",
        "post/:id": "showPost",
        "addQuestion": "addQuestion",
        "editpost/:id": "editPost",
        "addAnswer/:id": "addAnswer"
    },

    index: function(){
        console.log("[Router] Index");
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(MyQuestionAnswerApp.views.MainView.QuestionsView.render());
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.prepend('<a href="addQuestion" id="addQuestion" class="addquestion" >Add Question</a> <br>');
    },
    showPost: function(id){
        console.log("[Router] show one post");
        var model = MyQuestionAnswerApp.views.MainView.QuestionsCollection.get(id);
        var postview = new MyQuestionAnswerApp.views.PostView({model: model});
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(postview.render_with_answers());
    },
    addQuestion: function(){
        console.log("[Router] addQuestion");
        var question = new MyQuestionAnswerApp.models.Post({description: "What do you have in mind ?"});
        var questionEditForm = new MyQuestionAnswerApp.views.PostEditForm({model: question});
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(questionEditForm.render());
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.prepend('Add Question <br>');
    },

    addAnswer: function(id){
        console.log("[Router] addAnswer");
        var answer = new MyQuestionAnswerApp.models.Post({description: "the answer is..."});
        var answerEditForm = new MyQuestionAnswerApp.views.PostEditForm({model: answer});
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(answerEditForm.render_answer(id));
    },

    editPost: function(id){
        console.log("[Router] edit one post");
        var model = MyQuestionAnswerApp.views.MainView.QuestionsCollection.get(id);
        var editForm = new MyQuestionAnswerApp.views.PostEditForm({model: model});
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(editForm.render());
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.prepend('Edit Question <br>');
    }
}));

MyQuestionAnswerApp.views.MainAppContainer = Backbone.View.extend({
    tagName: "div",
    id: "app",

    render: function(){
        return this.el;
    }
});

MyQuestionAnswerApp.views.MainView = new (Backbone.View.extend({
    el: document.body,

    template: _.template('<h1> Your Q&A Feed </h1> <br><br><br> '),

    render: function(){
        console.log("[Main View] Rendering");
        this.$el.html(this.template());
        console.log("[Main View] html is: ", this.el);
    },

    events: {
        'click .addquestion': "addNewQuestion",
        'click .answer': "addNewAnswer"
    },

    addNewQuestion: function(event){
        event.preventDefault();
        console.log("[addNewQuestion Click Handler] triggering route");
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger:true});
    },

    addNewAnswer: function(event){
        event.preventDefault();
        console.log("[addNewAnswer Click Handler] triggering route");
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger:true});
    },

    start: function(){
        console.log("[Main View] Starting. Initial app html is: ", this.el)
        this.QuestionsCollection = new MyQuestionAnswerApp.collections.PostCollection();
        console.log("[Main View] Collection created");
        this.QuestionsView = new MyQuestionAnswerApp.views.PostCollectionView({collection: this.QuestionsCollection});
        this.mainContainer = new MyQuestionAnswerApp.views.MainAppContainer({});
        this.$el.append(this.mainContainer.render());
        console.log("[Main View] At start attached html is :", this.QuestionsView.el);
        Backbone.history.start({pushState:true});
    }
}));

$(function(){
    MyQuestionAnswerApp.views.MainView.render();
    MyQuestionAnswerApp.views.MainView.start();
});
