// My API key: {success:true,id:340}

$(document).ready(function() {
  /* ============ Get todos ============== */
  var getAndDisplayAllTasks = function() {
    $.ajax({
      type: 'GET',
      url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=340',
      dataType: 'json',

      success: function (response, textStatus) {
        // How do I check the checkbox when item is completed? Handlebars?
        console.log('response of GET request: ', response);
        // Empty todo list in DOM before displaying updated list of todos
        $('#todo-ul').empty();
        $(response.tasks).each(function(index, element) {
          var newToDo = `<li class="todo-item" data-id="${element.id}">
            <div class="show-todo-item">
              <input class="toggle" type="checkbox">
              <label>${element.content}</label>
              <button class="destroy">Remove</button>
            </div>
            <!-- field that displays when editing-->
            <input type="text" class="edit-todo-item">
          </li>`;
          // append it to ul element
          $('#todo-ul').append(newToDo);      
        });
      },
      error: function (request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
  };


  /* ======== Add a todo =========== */

  var addTodo = function() {
    $.ajax({
      type: 'POST', 
      url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=340',
      contentType: 'application/json',
      dataType: 'json', 
      data: JSON.stringify({
        task: {
          content: $('#new-todo').val()
        }
      }),
      success: function(response, textStatus) {
        console.log('response of POST request: ', response);
        getAndDisplayAllTasks();
      },
      error: function(request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    }); 
  };

  // Event listener for input field
  $('#new-todo').keyup(function(e) {
    console.log(e.which);
    if ($('#new-todo').val() !== '') {
      if(e.which === 13) {
        console.log('addTodo will be called');
        addTodo();
        $('#new-todo').val('');
      }
    }
  });

  /* ============= Remove a todo ============== */

  var removeToDo = function(idToRemove) {
    $.ajax({
      type: 'DELETE',
      url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks/' + idToRemove + '?api_key=340',
      success: function(response, textStatus) {
        getAndDisplayAllTasks();
      }, 
      error: function(request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
  };
  
  // Event listener on todo list, listening for clicks on remove buttons
  $('#todo-ul').on('click', '.destroy', function() {
    var id = $(this).parent().parent().data('id');
    removeToDo(id);
  });

  getAndDisplayAllTasks();

});




