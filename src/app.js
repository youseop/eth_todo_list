
App = {
    loading:false,
    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
          loader.show()
          content.hide()
        } else {
          loader.hide()
          content.show()
        }
    },
    contracts: {},
    load: async() => {
        console.log("app loading...");
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
    },
    
    loadWeb3: () => {
        let web3Injected = window.web3;
        if(typeof web3Injected !== 'undefined'){
          // detect MetaMask.io
          web3 = new Web3(window.ethereum)
        } else {
          // eth node
          web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'))
        }
        console.log("load web3...");
    },

    loadAccount: async () => {
        App.account = web3.eth.accounts[0];
        console.log("load account...", App.account);

        web3.eth.defaultAccount = App.account;
    },

    loadContract: async () => {
        const todoList = await $.getJSON('TodoList.json');
        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(window.ethereum);

        App.todoList = await App.contracts.TodoList.deployed();
        
        // console.log(todoList);
        // console.log(App.todoList);
    },

    render: async() => {
        if(App.loading){
            return
        }
        App.setLoading(true)
        $('#account').html(App.account)

        await App.renderTasks();

        App.setLoading(false)
    },

    renderTasks: async() => {
        //load the total task count from blockchain
        const taskCount = await App.todoList.taskCount();
        const $taskTemplate = $(".taskTemplate");

        //render out each task with a new task template
        for (let i = 1; i<=taskCount; i++){
            const task = await App.todoList.tasks(i);
            const taskId = task[0].toNumber();
            const taskContent = task[1];
            const taskCompleted = task[2];
            
            // Create the html for the task
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
            .prop('name', taskId)
            .prop('checked', taskCompleted)
            .on('click', App.toggleCompleted)
            
            // Put the task in the correct list
            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }
            
            // Show the task
            $newTaskTemplate.show()
        }
    },

    createTask: async () => {
        App.setLoading(true);
        const content = $('#newTask').val();
        await App.todoList.createTask(content);
        window.location.reload();
    },
    
    toggleCompleted: () => {

    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})