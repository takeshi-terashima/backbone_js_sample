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
        //インスタンス生成時に実行される関数のことを指す
        //名前はconstructor:function()と書いても問題ないが、既存のDOMと結びつける場合はinitializeを使用する
        initialize: function() {
        	//コールバック関数の設定、
        	//invalidはモデルのvalidateで結果が失敗した時に発火するものとなっている
        	//modelは今はおまじないという認識でよい
            this.on('invalid', function(model, error) {
                $('#error').html(error);//id名errorにエラーメッセージを代入
            });
        }
    });

    //コレクションの定義→複数のタスクを画面に表示させるために使用
    var Tasks = Backbone.Collection.extend({model: Task});
    
    //ビューの定義
    //各タスク（モデル）に対して行う処理を定義
    var TaskView = Backbone.View.extend({
        tagName: 'li',
        initialize: function() {
        	//destroyはコレクション内のモデルを破壊する時に発火するイベント
        	//似たものにremoveというのがあるが、removeはモデルの削除のみでdestroyはサーバーに削除リクエストも送る
        	//this.removeはcollectionの中の１メソッドのremoveで意味はコレクションからモデルを削除
            this.model.on('destroy', this.remove, this);
            //cahangeはモデル内のattributeに変更があった時に発火するイベント
            //view.renderはel(特定のDOM部分木の根の部分を指す）の下に対して操作したいときに使用する
            this.model.on('change', this.render, this);
        },
        //clickイベントの作成
        //el以下のclass=deleteで発生するイベント、class=toggleで発生するイベントという意味になる
        //それぞれは下記に記載されているkey値のfunctionを呼んでいる
        events: {
            'click .delete': 'destroy',
            'click .toggle': 'toggle'
        },
        //toggleは同じ機能・動きを繰り返すことでON/OFFを入れ替えることの意
        //ここではタスクの完了・未完了を切り替える関数となっている
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
        //templeteを利用することでjsファイル内にhtmlを記載しなくてよくなる
        //これでhtmlの指定した部分木のテンプレートを取得できたため、
        //render時に各モデル（中身はタスク）をテンプレートの中に追加している
        template: _.template($('#task-template').html()),
        render: function() {
        	//toJSON()はコレクションにモデルの各属性のハッシュ値を含んだ配列を返す時に使用する
            var template = this.template(this.model.toJSON());
            this.$el.html(template);
            return this;
        }
    });
    //タスクのリスト（コレクション）に対して行う処理を定義
    var TasksView = Backbone.View.extend({
        tagName: 'ul',
        initialize: function() {
        	//addはコレクションにモデルが追加されたときに発火するイベント
            this.collection.on('add', this.addNew, this);
            this.collection.on('change', this.updateCount, this);
            this.collection.on('destroy', this.updateCount, this);
        },
        addNew: function(task) {
            var taskView = new TaskView({model: task});
            //$elはjQueryオブジェクトを指しているため
            this.$el.append(taskView.render().el);
            //focusはjQueryライブラリの関数で、指定の場所にフォーカスを当てる
            //ここでの処理は追加ボタンを押下するとタスク名の部分を空にし、
            //そこにマウスカーソルを当てる処理となっている
            $('#title').val('').focus();
            this.updateCount();//タスクを追加したため件数を再計算
        },
        //残っているタスクの数を数えている
        updateCount: function() {
        	//filter(function)は引数のfunctionを駆動し、
        	//その中で結果が真になるもののみをまとめたコレクションを返す
        	//ここでは完了していないタスクのみのコレクションを作成するメソッド
            var uncompletedTasks = this.collection.filter(function(task) {
                return !task.get('completed');
            });
            $('#count').html(uncompletedTasks.length);
        },
        render: function() {
        	//each(function())はコレクションの各要素それぞれに、
        	//引数で指定した関数を実行するメソッド
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
        	//preventDefaultはjQueryのメソッドでクリックした際にその要素のイベントを無効にする
            e.preventDefault();
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
    
        //Routerの定義
    var MyRouter = Backbone.Router.extend({
        routes:{
            "foo/:hoge": "bar",
        },
        bar: function(hoge) {
            alert(hoge);
        }
    });
    window.router = new MyRouter();
    Backbone.history.start();
})();
