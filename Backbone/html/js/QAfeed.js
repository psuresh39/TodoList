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
       	description: "",
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
        this.listenTo(this.collection, 'add', this.addOne);
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'all', this.render);
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

    render: function(addQuestionLink){
        console.log("[PostCollectionView] rendering");
        this.$el.empty();
        this.addAll();
        if (typeof(addQuestionLink)==="undefined" || addQuestionLink === true) {
            this.$el.prepend('<a href="addQuestion" id="addQuestion" class="addquestion" >Add Question</a> <br>');
        }
        return this.el;
    },

    events:{
        'click .addquestion': 'addNewQuestion',
    },

    addNewQuestion: function(event){
        event.preventDefault();
        console.log("[addNewQuestion Click Handler] triggering route", event);
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger:true});
    }
});

MyQuestionAnswerApp.views.PostView = Backbone.View.extend({
    tagName: "li",
    initialize: function(){
        console.log("[PostView] initialize");
    },

    template: _.template('<% if(type === 0) { %><h3> <%= description %></h3><a href="question/<%= id %>" id="question/<%= id %>" class="showquestion" >more</a> &nbsp&nbsp <a href="editquestion/<%= id %>" id="editquestion/<%= id %>" class="editquestion" >edit</a>&nbsp&nbsp<a href="deletequestion/<%= id %>" id="<%= id %>" class="deletequestion" >delete</a><% } else { %> <h4> <%= description %></h4><a href="editanswer/<%= parent_id %>-<%= id %>" id="editanswer/<%= parent_id %>-<%= id  %>" class="editanswer" >edit</a>&nbsp&nbsp<a href="deleteanswer/<%=parent_id %>-<%= id %>" id="<%= parent_id %>-<%= id %>>" class="deleteanswer" >delete</a><% } %>'),



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
        this.$el.prepend('<a href="addAnswer/'+this.model.id+ '" id="addAnswer/'+this.model.id+ '" class="addanswer" >Add Answer</a> <br>');
        var answerList = new (Backbone.Firebase.Collection.extend({
            firebase: new Firebase("https://somecrawl.firebaseio.com/answers/"+this.model.id), 
            model:MyQuestionAnswerApp.models.Post
        }));
        var answerListView = new MyQuestionAnswerApp.views.PostCollectionView({collection: answerList});
        this.$el.append(answerListView.render(false));
        return this.el;
    },

    events:{
        'click .showquestion': 'showQuestion',
        'click .editquestion': 'editQuestion',
        'click .deletequestion': 'deleteQuestion',
        'click .addanswer': 'addAnswer',
        'click .editanswer': 'editAnswer',
        'click .deleteanswer': 'deleteAnswer'
    },

    addAnswer: function(event){
        event.preventDefault();
        console.log("[PostView addAnswer] Click Event :" , event);
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger: true});
    },

    editAnswer: function(event){
        event.preventDefault();
        console.log("[PostView editAnswer] Click Event :" , event);
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger: true});
    },

    showQuestion: function(event){
        event.preventDefault();
        console.log("[PostView showPost] Click Event :" , event);
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger: true});
    },

    editQuestion: function(event){
        event.preventDefault();
        console.log("[PostView EditPost] Click Event :" , event);
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate(event.target.id, {trigger: true});
    },

    deleteQuestion: function(event){
        event.preventDefault();
        console.log("[PostView DeletePost] Click Event :" , event);
        var model = MyQuestionAnswerApp.views.MainView.QuestionsCollection.get(event.target.id);
        MyQuestionAnswerApp.views.MainView.QuestionsCollection.remove(model);
    },

    remove:function(){
        console.log("[PostView remove] Event: Remove item");
        this.$el.remove();
    },

});

MyQuestionAnswerApp.views.PostEditForm = Backbone.View.extend({

    question_template: _.template('<form>' + '<input name=description value="<%= description %>" />' + '<button class="editquestion">Save</button></form>'),

    answer_template: _.template('<form>' + '<input name=description value="<%= description %>" />' + '<button class="editanswer">Save</button></form>'),

    render_question: function(){
        console.log("[PostEditForm] Rendering form");
        this.$el.html(this.question_template(this.model.attributes));
        this.$el.prepend('Add or Edit Question <br>');
        return this.el;
    },

    render_answer: function(id){
        console.log("[PostEditForm] inside render_answer");
        this.question_id = id;
        this.$el.html(this.answer_template(this.model.attributes));
        this.$el.prepend('Add or Edit Answer <br>');
        return this.el;
    },

    events: {
        'click .editquestion': 'save_question',
        'click .editanswer': 'save_answer'
    },


    generate_id: function (){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '' + s4() + '' + s4() + '' + s4() + '' + s4() + s4() + s4();
    },

    save_question: function(e){
        e.preventDefault();
        console.log("[Save Click handler] saving model and trigger Q&Afeed.html")
        var desc = this.$('input[name=description]').val();
        if (this.model.has('id')){
            console.log("[Save Click handler] Existing model, just save")
            this.model.set('description', desc);
        }
        else {
            console.log("[Save Click Handler] New model, add to collection");
            var question = new MyQuestionAnswerApp.models.Post({description:desc, id:this.generate_id(), type: 0});
            MyQuestionAnswerApp.views.MainView.QuestionsCollection.add(question);
        }
        MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate("Q&Afeed.html", {trigger: true});
    },

    save_answer: function(e){
        e.preventDefault();
        console.log("[Save ANS Click handler] saving model and trigger questions details page");
        var desc = this.$('input[name=description]').val();
        if (this.model.has('id')){
            console.log("[Save ANS Click handler] Existing model, just save", this.model);
            var answer_dummy_view = new MyQuestionAnswerApp.views.PostView({model: this.model});
            this.model.set('description', desc);
            MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate("question/"+this.model.attributes.parent_id, {trigger: true});
        }
        else {
            console.log("[Save ANS Click handler] New model, add to collection", this.question_id);
            var answer = new MyQuestionAnswerApp.models.Post({description:desc, id:this.generate_id(), parent_id:this.question_id, type: 1});
            var answerCollection = new (Backbone.Firebase.Collection.extend({
                firebase: new Firebase("https://somecrawl.firebaseio.com/answers/"+this.question_id),
                model:MyQuestionAnswerApp.models.Post
            }));	
            answerCollection.add(answer);
            MyQuestionAnswerApp.QuestionAnswerAppRouter.navigate("question/"+this.question_id, {trigger: true});
        }
    }
});


MyQuestionAnswerApp.QuestionAnswerAppRouter = new (Backbone.Router.extend({
    routes: {
        "Q&Afeed.html":"index",
        "question/:id": "showQuestion",
        "addQuestion": "addQuestion",
        "editquestion/:id": "editQuestion",
        "addAnswer/:id": "addAnswer",
        "editanswer/:parent_id-:id": "editAnswer",
    },

    index: function(){
        console.log("[Router] Index");
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(MyQuestionAnswerApp.views.MainView.QuestionsView.render());
    },
    showQuestion: function(id){
        console.log("[Router] show one question");
        var model = MyQuestionAnswerApp.views.MainView.QuestionsCollection.get(id);
        var postview = new MyQuestionAnswerApp.views.PostView({model: model});
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(postview.render_with_answers());
    },
 
    addQuestion: function(){
        console.log("[Router] addQuestion");
        var question = new MyQuestionAnswerApp.models.Post({description: "What do you have in mind ?"});
        var questionEditForm = new MyQuestionAnswerApp.views.PostEditForm({model: question});
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(questionEditForm.render_question());
    },

    addAnswer: function(id){
        console.log("[Router] addAnswer");
        var answer = new MyQuestionAnswerApp.models.Post({description: "the answer is..."});
        var answerEditForm = new MyQuestionAnswerApp.views.PostEditForm({model: answer});
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(answerEditForm.render_answer(id));
    },

    editAnswer: function(parent_id, id){
        console.log("[Router] edit one answer");
        var answer = new (Backbone.Firebase.Model.extend({
            firebase: "https://somecrawl.firebaseio.com/answers/" + parent_id + '/' + id,
        }));
        //var model = answer_collection.get(id);
        var editForm = new MyQuestionAnswerApp.views.PostEditForm({model: answer});
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(editForm.render_answer());
    },

    editQuestion: function(id){
        console.log("[Router] edit one question");
        var model = MyQuestionAnswerApp.views.MainView.QuestionsCollection.get(id);
        var editForm = new MyQuestionAnswerApp.views.PostEditForm({model: model});
        MyQuestionAnswerApp.views.MainView.mainContainer.$el.html(editForm.render_question());
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
