// My API key: {success:true,id:340}

$(document).ready(function() {
  var numberOfCompletedTodos = 0;
  var numberOfTodos = 0;

  /* ============ Get todos ============== */
  var getAndDisplayAllTasks = function() {
    console.log('getAndDisplayAllTasks runs');
    
    $.ajax({
      type: 'GET',
      url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=340',
      dataType: 'json',

      success: function (response, textStatus) {
        // Why does ajax request run only AFTER getAndDisplayAllTasks has been called and the rest of the code has been parsed?
        console.log('success method runs');

        numberOfTodos = 0;
        numberOfCompletedTodos = 0;
        // Empty todo list in DOM before displaying updated list of todos
        $('#todo-list').empty();

        if (numberOfTodos === 0) {
          $('#footer').addClass('hide-footer');
        }

        $(response.tasks).each(function(index, element) {
          var newToDo = 
          `<div class="todo-item row" data-id="${element.id}">
            <div class="col-xs-12">
              <div class="row show-todo-item">
                <input type="checkbox" class="toggle col-xs-1" data-id="${element.id}" ${(element.completed ? 'checked' : '')}>
                <label class="col-xs-9">${element.content}</label>
                <button class="destroy btn btn-danger">Remove</button>
              </div>
              <input type="text" class="edit-todo-item col-xs-offset-1 col-xs-9">
            </div>
          </div>`;

          // append it to todo list
          $('#todo-list').append(newToDo); 
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

          // Display number of active items in footer | V2, as putting this in a separate function didn't work
          // Is there a way to display the footer without running this code every time a todo is requested?
          var activeTodos = numberOfTodos - numberOfCompletedTodos;
          if (activeTodos > 1 || activeTodos === 0) {
            $('#footer').removeClass('hide-footer');
            $('#todo-count').html(`<strong>${activeTodos}</strong> items left`);
          } else if (activeTodos === 1) {
            $('#footer').removeClass('hide-footer');
            $('#todo-count').html(`<strong>${activeTodos}</strong> item left`);
          } 
          
          console.log('numberOfTodos: ', numberOfTodos);
          console.log('numberOfCompletedTodos: ', numberOfCompletedTodos);
          console.log('active todos: ', numberOfTodos - numberOfCompletedTodos);
        });
      },
      error: function (request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
  };


  // ================ V1: Render active item counter in footer =================
  // ==== DOES NOT WORK. renderFooter IS CALLED BEFORE getAndDisplayAllTasks RUNS THE AJAX REQUEST. THEREFORE, renderFooter SHOWS ACTIVETODOS AS 0. =========

  // Q: I want to call renderFooter after all todos have been displayed - i.e. after getAndDisplayAllTasks has run. However, even though I call renderFooter after getAndDisplayAllTasks, the item counter in the footer is not shown. The number of todos/active todos / completed todos is not known. Has getAndDisplayAllTasks not been called yet?
  // When adding a breakpoint on the calls for getAndDisplayAllTasks() and renderFooter(), 

  // var showItemsLeft = function() {
  //   console.log('showItemsLeft runs');
  //   var activeTodos = numberOfTodos - numberOfCompletedTodos;
  //   if (activeTodos > 1) {
  //     $('.todo-count').html(`<strong>${activeTodos}</strong> items left`);
  //   } else if (activeTodos === 1) {
  //     $('.todo-count').html(`<strong>${activeTodos}</strong> item left`);
  //   } else if (activeTodos === 0) {
  //     // $('#footer').addClass('hide-footer');
  //     // Where do I have to remove .hide-footer again?
  //   }
  // };

  // // Separate function renderFooter, to be called after getAndDisplayAllTasks
  // // render number of items left
  // // render filters
  // var renderFooter = function() {
  //   console.log('renderFooter runs');
  //   showItemsLeft();
  // };

  // renderFooter();


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

  // Event listener for add-todo-button
  $('#add-todo-button').click(function(event) {
    if ($('#new-todo').val() !== '') {
      addTodo();
      $('#new-todo').val('');
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
  
  // Event listener on document, listening for clicks on remove buttons
  $(document).on('click', '.destroy', function() {
    var id = $(this).prevAll('input').data('id');
    removeToDo(id);
  });


  // ================ Edit a todo ====================
 
  var editTodo = function(editedToDo, idToEdit) { // Ist es ein Problem, dass die Parameter dieselben Namen haben wie die Argumente?
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


  var makeTodoEditable = function(event) {
    // Hide todo item
    $(event.currentTarget).addClass('editing');
    // Show edit input field and focus on it
    $(event.currentTarget).next('.edit-todo-item').addClass('editing').focus();
    // Set initial value of edit input field to initial todo
    $(event.currentTarget).next('.edit-todo-item').val($(event.currentTarget).find('label').text());
  };


  // Event listener on document, listening for doubleclicks on todo items
  $(document).on('dblclick', '.show-todo-item', function(event) {
    makeTodoEditable(event);
  });


  // if user clicks outside edit input field or leaves it with tab, display initial todo again
  $(document).on('focusout', '.edit-todo-item.editing', function() {
    $('.editing').each(function(index, element) {
      $(element).removeClass('editing');
    });
  });


  // Event listener on document, listening for keyup event on edit input field
  $(document).on('keyup', '.edit-todo-item', function(event) {
    console.log('editkeyup event: ', event);
    var idToEdit = $(event.target).prev().find('input').data('id');
    // if user hits Enter
    if (event.key === "Enter") { 
      if ($(event.target).val() !== '') { 
        var editedToDo = $(event.target).val();
        editTodo(editedToDo, idToEdit);
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
        getAndDisplayAllTasks();
      },
      error: function(request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
  };
  

  // Listen for 'change' events on item checkbox ('change' instead of 'click' event, to make checkbox accessible)
  $(document).on('change', '.toggle', function(event) {
    var idToToggle = $(this).data('id');
    // Check the current, changed state of checkbox:
    if (this.checked === true) {
      markAsCompleted(idToToggle);
    } else if (this.checked === false) {
      markAsActive(idToToggle)
    }
  });



  // ========== Toggle all todos =====================

  // Listen for 'change' events on toggle all checkbox (not just 'click' events, to make checkbox accessible)
  $('#toggle-all').change(function(event) {
    if (numberOfTodos === numberOfCompletedTodos) {
      // mark all as active
      $('#todo-list .todo-item').each(function(index, element) {
        markAsActive($(element).data('id'));
      });
    } else {
      // mark all as complete
      $('#todo-list .todo-item').each(function(index, element) {
        markAsCompleted($(element).data('id'));
      });
    }
  });


  // =========== Filter all, active and completed todos ==============
  var showCompletedTodos = function() {
    $.ajax({
      type: 'GET',
      url: 'https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=340',
      dataType: 'json',

      success: function (response, textStatus) {
        // Empty todo list in DOM before displaying updated list of todos
        $('#todo-list').empty();
        $(response.tasks).each(function(index, element) {
          if (element.completed === true) {
            var newToDo = 
            `<div class="todo-item row" data-id="${element.id}">
              <div class="col-xs-12">
                <div class="row show-todo-item">
                  <input type="checkbox" class="toggle col-xs-1" data-id="${element.id}" ${(element.completed ? 'checked' : '')}>
                  <label class="col-xs-9">${element.content}</label>
                  <button class="destroy col-xs-2">Remove</button>
                </div>
                <input type="text" class="edit-todo-item col-xs-offset-1 col-xs-9">
              </div>
            </div>`;

            $('#todo-list').append(newToDo);  
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
        // Empty todo list in DOM before displaying updated list of todos
        $('#todo-list').empty();
        $(response.tasks).each(function(index, element) {
          if (element.completed === false) {
            var newToDo = 
            `<div class="todo-item row" data-id="${element.id}">
              <div class="col-xs-12">
                <div class="row show-todo-item">
                  <input type="checkbox" class="toggle col-xs-1" data-id="${element.id}" ${(element.completed ? 'checked' : '')}>
                  <label class="col-xs-9">${element.content}</label>
                  <button class="destroy btn btn-danger">Remove</button>
                </div>
                <input type="text" class="edit-todo-item col-xs-offset-1 col-xs-9">
              </div>
            </div>`;

            $('#todo-list').append(newToDo);  
          }
        });
      },
      error: function (request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    })
  };
  

  var displayFilteredTodos = function(event) {
    // Show border around selected filter
    $('#filters a').each(function(index, element) {
      if($(element).hasClass('selected')) {
        $(element).removeClass('selected');
      }
    });
    $(event.target).addClass('selected');

    if ($(event.target).hasClass('completed')) {
      showCompletedTodos();
    } else if($(event.target).hasClass('active')) {
      showActiveTodos();
    } else if($(event.target).hasClass('all')) {
      getAndDisplayAllTasks();
    }
  };

  // Listen for click events on filters in footer
  $('#filters').on('click', function(event) {
    displayFilteredTodos(event);
  });

  // Listen for keyup events with space key in footer (for accessibility)
  $('#filters').on('keyup', function(event) {
    if (event.which === 32) {
     displayFilteredTodos(event);
    }
  });


  // Observation: When I call getAndDisplayAllTasks(), it is run only up until (and excluding) the Ajax request; then the lines after the function call (see below) are run, and THEN the Ajax request. Why?
  // I tried to write a separate function renderFooter that would display the items left, and would be called inside the ajax request in getAndDisplayAllTasks, but that didn't work.
  getAndDisplayAllTasks();
  console.log('after  getAndDisplayAllTasks(): numberOfTodos: ', numberOfTodos);
  console.log('after getAndDisplayAllTasks(): numberOfCompletedTodos: ', numberOfCompletedTodos);
  console.log('after  getAndDisplayAllTasks(): active todos: ', numberOfTodos - numberOfCompletedTodos);
});

