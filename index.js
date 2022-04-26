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


  // ================ Edit a todo ====================

  var editOnEnter = function(editedToDo, idToEdit) { // Ist es ein Problem, dass die Parameter dieselben Namen haben wie die Argumente?
    console.log('editedToDo: ', editedToDo);
    console.log('idToEdit: ', idToEdit);
    $.ajax({
      type: 'PUT',
      url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks/' + idToEdit + '?api_key=340',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        task: {
          content: editedToDo
        }
      }),
      success: function(response, textStatus) {
        console.log(response);
        // fetch the element with idToEdit
        // .removeClass() and addClass() don't work with this selector. Assumption: We are not dealing with a DOM element, but with an object?
        // var elementToEdit = $(`li[data-id|='${idToEdit}']`);
        $('.editing').each(function(index, element) {
          $(element).removeClass('editing');
        });

        getAndDisplayAllTasks();
      }, 
      error: function(request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
  };

  
  var editToDo = function(event) {
    $(event.target).addClass('editing');
    $(event.target).next('.edit-todo-item').addClass('editing');
    $(event.target).next('.edit-todo-item').focus();
    // Set initial value of edit input field to initial todo
    $(event.target).next('.edit-todo-item').val($(event.target).find('label').text());
  };


  // Event listener on ul element, listening for doubleclicks on todo items
  $('#todo-ul').on('dblclick', '.show-todo-item', function(event) {
    console.log(this);
    console.log(event);
    editToDo(event);
  });


  // if user clicks outside edit input field or leaves it with tab, display initial todo again
  $(document).on('focusout', '.edit-todo-item.editing', function() {
    $('.editing').each(function(index, element) {
      $(element).removeClass('editing');
    });
  });


  // Event listener on ul element, listening for keyup event on edit input field
  $('#todo-ul').on('keyup', '.edit-todo-item', function(event) {
    var idToEdit = $(event.target).parent().data('id');
    // if user hits Enter
    if (event.key === "Enter") { 
      if ($(event.target).val() !== '') { 
        var editedToDo = $(event.target).val();
        editOnEnter(editedToDo, idToEdit);
        $(event.target).blur();
      }
    // if user hits Escape
    } else if (event.key === "Escape") {
      $(event.target).removeClass('editing');
      $(event.target).prev('.show-todo-item').removeClass('editing');
      $(event.target).blur();
    }    
  });

  
  //============= Mark a todo as completed/not completed ============ 

  // Event listener auf input.toggle: click, focusin (inkludiert focusin auch click?)
    // get id of current element
    // if checkbox is checked:
      // completedPropertyToSend = false
    // else if checkbox is not checked:
      // completedPropertyToSend = true


});

