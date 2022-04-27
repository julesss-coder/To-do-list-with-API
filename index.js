// My API key: {success:true,id:340}

$(document).ready(function() {
  var numberOfCompletedTodos = 0;
  var numberOfTodos = 0;

  /* ============ Get todos ============== */
  var getAndDisplayAllTasks = function() {
    
    $.ajax({
      type: 'GET',
      url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=340',
      dataType: 'json',

      success: function (response, textStatus) {
        console.log('response of GET request in getAndDisplayAllTodos: ', response);
        numberOfTodos = 0;
        numberOfCompletedTodos = 0;
        // Empty todo list in DOM before displaying updated list of todos
        $('#todo-ul').empty();
        $(response.tasks).each(function(index, element) {
          var newToDo = `<li class="todo-item" data-id="${element.id}">
            <div class="show-todo-item">
              <input class="toggle" type="checkbox" data-id="${element.id}" ${(element.completed ? 'checked' : '')}>
              <label>${element.content}</label>
              <button class="destroy">Remove</button>
            </div>
            <input type="text" class="edit-todo-item">
          </li>`;

          // append it to ul element
          $('#todo-ul').append(newToDo); 
          numberOfTodos++;    

          // if todo is completed, increment numberOfCompletedTodos
          if (element.completed === true) {
            numberOfCompletedTodos++;
          }

          // if all todos are completed, toggle-all checkbox should be checked
          if (numberOfTodos === numberOfCompletedTodos) {
            $('#toggle-all').prop('checked', true);
          } else {
            $('#toggle-all').prop('checked', false);
          }
          
          console.log('numberOfTodos: ', numberOfTodos);
          console.log('numberOfCompletedTodos: ', numberOfCompletedTodos);
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

  
  //============= Mark a todo as completed/active ============ 

  var markAsCompleted = function(idToToggle) {
    $.ajax({
      type: 'PUT',
      url: `https://altcademy-to-do-list-api.herokuapp.com/tasks/${idToToggle}/mark_complete?api_key=340`, // id einfügen
      dataType: 'json',
      success: function(response, textStatus) {
        // numberOfCompletedTodos++; // brauche ich nicht, da in getAndDisplayAllTasks die completed Todos gezählt werden
        getAndDisplayAllTasks();
      },
      error: function(request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
  };

  var markAsActive = function(idToToggle) {
    $.ajax({
      type: 'PUT',
      url: `https://altcademy-to-do-list-api.herokuapp.com/tasks/${idToToggle}/mark_active?api_key=340`, // id einfügen
      dataType: 'json',
      success: function(response, textStatus) {
        // numberOfCompletedTodos--;  // brauche ich nicht, da in getAndDisplayAllTasks die completed Todos gezählt werden
        getAndDisplayAllTasks();
      },
      error: function(request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
  };
  

  // Event listener auf input.toggle: click, focusin (inkludiert focusin auch click?)
  $(document).on('focusin', '.toggle', function(event) {
    var idToToggle = $(this).data('id');
    if (this.checked === true) {
      markAsActive(idToToggle)
    } else if (this.checked === false) {
      markAsCompleted(idToToggle);
    }
  });



  // ========== Toggle all todos =====================
  // Option: 
  // var markAllCompleted = function() {
  //   $.ajax({
  //     type: 'GET',
  //     url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=340',
  //     dataType: 'json',

  //     success: function (response, textStatus) {
  //       console.log('response of GET request: ', response);
  //       // Empty todo list in DOM before displaying updated list of todos
  //       $('#todo-ul').empty();
  //       $(response.tasks).each(function(index, element) {
  //         markAsCompleted(element.id);
  //       });    
  //     },
  //     error: function (request, textStatus, errorMessage) {
  //       console.log(errorMessage);
  //     }
  //   });
  // };

  // WORKS! V2  without calling a separate function to mark all as completed

  $('#toggle-all').click(function(event) {
    if (numberOfTodos === numberOfCompletedTodos) {
      // mark all as active
      $('#todo-ul li').each(function(index, element) {
        markAsActive($(element).data('id'));
      });
      // toggle all checkbox should be unchecked
      $('#toggle-all').prop('checked', false);
    } else {
      // mark all as complete
      $('#todo-ul li').each(function(index, element) {
        markAsCompleted($(element).data('id'));
      });
      // toggle-all checkbox should be checked
      $('#toggle-all').prop('checked', true);
    }
  });

  // If click on toggle all checkbox:
  // WORKS, V1 using a separate function to mark all as completed
  // $('#toggle-all').click(function(event) {
  //   // if all are completed
  //   if (numberOfTodos === numberOfCompletedTodos) {
  //     // markAllActive()
  //   } else {
  //     markAllCompleted();
  //   }
  // });
  //   if all are completed:
  //     // Make GET request and check if number of completed todos === number of todos  
  //     make all active:
  //       PUT request to make all active
  //   else if all/some are active:
  //     make all completed:
  //       PUT request to make all completed




  // =========== Filter all, active and completed todos ==============
  var showCompletedTodos = function() {
    $.ajax({
      type: 'GET',
      url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=340',
      dataType: 'json',

      success: function (response, textStatus) {
        console.log('response of GET request: ', response);
        // Empty todo list in DOM before displaying updated list of todos
        $('#todo-ul').empty();
        $(response.tasks).each(function(index, element) {
          if (element.completed === true) {
            var newToDo = `<li class="todo-item" data-id="${element.id}">
            <div class="show-todo-item">
              <input class="toggle" type="checkbox" data-id="${element.id}" ${(element.completed ? 'checked' : '')}>
              <label>${element.content}</label>
              <button class="destroy">Remove</button>
            </div>
            <input type="text" class="edit-todo-item">
          </li>`;
            $('#todo-ul').append(newToDo);  
          }
        });
      },
      error: function (request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    })
  };

  var showActiveTodos = function() {
    $.ajax({
      type: 'GET',
      url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=340',
      dataType: 'json',

      success: function (response, textStatus) {
        console.log('response of GET request: ', response);
        // Empty todo list in DOM before displaying updated list of todos
        $('#todo-ul').empty();
        $(response.tasks).each(function(index, element) {
          if (element.completed === false) {
            var newToDo = `<li class="todo-item" data-id="${element.id}">
            <div class="show-todo-item">
              <input class="toggle" type="checkbox" data-id="${element.id}" ${(element.completed ? 'checked' : '')}>
              <label>${element.content}</label>
              <button class="destroy">Remove</button>
            </div>
            <input type="text" class="edit-todo-item">
          </li>`;
            $('#todo-ul').append(newToDo);  
          }
        });
      },
      error: function (request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    })
  };
  
  // Event listener on filters in footer
  // If change event on .filters:
  // How do I make it accessible for keyboard users?
  $('.filters').on('click', function(event) {
    console.log(event.target);
    if ($(event.target).hasClass('completed')) {
      showCompletedTodos();
    } else if($(event.target).hasClass('active')) {
      showActiveTodos();
    } else if($(event.target).hasClass('all')) {
      getAndDisplayAllTasks();
    }
  });


  // Show how many items are left
  // change item to items when there is more than 1 active todo
});

