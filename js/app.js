(function() {

    //モデルの定義
    var Task = Backbone.Model.extend({
        defaults: {
            title: 'do something',
            completed: false
        },
        //validate()は検証のためのメソッドでset()で値を設定時に起動させることができる
        //set()の引数に{validate:true}のように設定し、
        //set()メソッドの中でthis._validate(attrs,option)の形でvalidateの値となっている関数を駆動しているため、function(attrs)という書き方となっている。
        validate: function(attrs) {
            //isEmptyはunderscore.jsの機能
            if (_.isEmpty(attrs.title)) {
                return 'Title must not be empty.';
            }
        },
        //
        initialize: function() {
            this.on('invalid', function(model, error) {
                $('#error').html(error);//id名errorにエラーメッセージを代入
            });
        }
    });

    //コレクションの定義→複数のタスクを画面に表示させるために使用
    var Tasks = Backbone.Collection.extend({model: Task});
    
    //ビューの定義
    var TaskView = Backbone.View.extend({
        tagName: 'li',
        initialize: function() {
            this.model.on('destroy', this.remove, this);
            this.model.on('change', this.render, this);
        },
        events: {
            'click .delete': 'destroy',
            'click .toggle': 'toggle'
        },
        toggle: function() {
            this.model.set('completed', !this.model.get('completed'));
        },
        destroy: function() {
            if (confirm('Are you sure?')) {
                this.model.destroy();
            }
        },
        remove: function() {
            this.$el.remove();
        },
        template: _.template($('#task-template').html()),
        render: function() {
            var template = this.template(this.model.toJSON());
            this.$el.html(template);
            return this;
        }
    });
    var TasksView = Backbone.View.extend({
        tagName: 'ul',
        initialize: function() {
            this.collection.on('add', this.addNew, this);
            this.collection.on('change', this.updateCount, this);
            this.collection.on('destroy', this.updateCount, this);
        },
        addNew: function(task) {
            var taskView = new TaskView({model: task});
            this.$el.append(taskView.render().el);
            $('#title').val('').focus();
            this.updateCount();
        },
        updateCount: function() {
            var uncompletedTasks = this.collection.filter(function(task) {
                return !task.get('completed');
            });
            $('#count').html(uncompletedTasks.length);
        },
        render: function() {
            this.collection.each(function(task) {
                var taskView = new TaskView({model: task});
                this.$el.append(taskView.render().el);
            }, this);
            this.updateCount();
            return this;
        }
    });
    
    var AddTaskView = Backbone.View.extend({
        el: '#addTask',
        events: {
            'submit': 'submit'
        },
        submit: function(e) {
            e.preventDefault();
            //var task = new Task({title: $('#title').val()});
            var task = new Task();
            //if文でsetを使用し、validateを使用することで検証が上手くいけば正常にタスクを登録できる
            //validateのtrueをfalseに変更すると検証をしなくなるようにできる→記載しないのと同じ
            if (task.set({title: $('#title').val()}, {validate: true})) {
                this.collection.add(task);
                $('#error').empty();
            }
        }
    });
    
    var tasks = new Tasks([
        {
            title: 'task1',
            completed: true
        },
        {
            title: 'task2'
        },
        {
            title: 'task3'
        }
    ]);
    
    var tasksView = new TasksView({collection: tasks});
    var addTaskView = new AddTaskView({collection: tasks});
    
    $('#tasks').html(tasksView.render().el);
    
    })();