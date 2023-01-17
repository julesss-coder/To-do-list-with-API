// New API URL: https://fewd-todolist-api.onrender.com/
// API key: {success:true,id:63}

$(window).on('load', function() {
  $('#loader').fadeOut(400);

  var numberOfCompletedTodos = 0;
  var numberOfTodos = 0;

  /* ============ Get todos ============== */
  var getAndDisplayAllTasks = function() {    
    $.ajax({
      type: 'GET',
      url: 'https://fewd-todolist-api.onrender.com/tasks?api_key=63',
      dataType: 'json',

      success: function (response, textStatus) {
        numberOfTodos = 0;
        numberOfCompletedTodos = 0;
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
                <label class="col-xs-10">${element.content}</label>
                <button class="destroy btn btn-danger">
                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>
              </div>
              <input type="text" class="edit-todo-item col-xs-offset-1 col-xs-9">
            </div>
          </div>`;

          $('#todo-list').append(newToDo); 
          numberOfTodos++;    

          if (element.completed === true) {
            numberOfCompletedTodos++;
          }

          if (numberOfTodos === numberOfCompletedTodos) {
            $('#toggle-all').prop('checked', true);
          } else {
            $('#toggle-all').prop('checked', false);
          }

          var activeTodos = numberOfTodos - numberOfCompletedTodos;
          if (activeTodos > 1 || activeTodos === 0) {
            $('#footer').removeClass('hide-footer');
            $('#todo-count').html(`<strong>${activeTodos}</strong> items left`);
          } else if (activeTodos === 1) {
            $('#footer').removeClass('hide-footer');
            $('#todo-count').html(`<strong>${activeTodos}</strong> item left`);
          } 
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
      url: 'https://fewd-todolist-api.onrender.com/tasks?api_key=63',
      contentType: 'application/json',
      dataType: 'json', 
      data: JSON.stringify({
        task: {
          content: $('#new-todo').val()
        }
      }),
      success: function(response, textStatus) {
        getAndDisplayAllTasks();
      },
      error: function(request, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    }); 
  };

  // Event listener for input field
  $('#new-todo').keyup(function(e) {
    if ($('#new-todo').val() !== '') {
      if(e.which === 13) {
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
      url: 'https://fewd-todolist-api.onrender.com/tasks/' + idToRemove + '?api_key=63',
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
 
  var editTodo = function(editedToDo, idToEdit) {
    $.ajax({
      type: 'PUT',
      url: 'https://fewd-todolist-api.onrender.com/tasks/' + idToEdit + '?api_key=63',
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


  // If user clicks outside edit input field or leaves it with tab, display initial todo again:
  $(document).on('focusout', '.edit-todo-item.editing', function() {
    $('.editing').each(function(index, element) {
      $(element).removeClass('editing');
    });
  });


  // Event listener on document, listening for keyup event on edit input field
  $(document).on('keyup', '.edit-todo-item', function(event) {
    var idToEdit = $(event.target).prev().find('input').data('id');
    // if user hits Enter
    if (event.key === "Enter") { 
      if ($(event.target).val() !== '') { 
        var editedToDo = $(event.target).val();
        editTodo(editedToDo, idToEdit);
        $(event.target).blur();
      }
    // If user hits Escape:
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
      url: `https://fewd-todolist-api.onrender.com/tasks/${idToToggle}/mark_complete?api_key=63`,
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
      url: `https://fewd-todolist-api.onrender.com/tasks/${idToToggle}/mark_active?api_key=63`, 
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
      url: 'https://fewd-todolist-api.onrender.com/tasks?api_key=63',
      dataType: 'json',

      success: function (response, textStatus) {
        $('#todo-list').empty();
        $(response.tasks).each(function(index, element) {
          if (element.completed === true) {
            var newToDo = 
            `<div class="todo-item row" data-id="${element.id}">
              <div class="col-xs-12">
                <div class="row show-todo-item">
                  <input type="checkbox" class="toggle col-xs-1" data-id="${element.id}" ${(element.completed ? 'checked' : '')}>
                  <label class="col-xs-10">${element.content}</label>
                  <button class="destroy btn btn-danger">
                  <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                  </button>
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
      url: 'https://fewd-todolist-api.onrender.com/tasks?api_key=63',
      dataType: 'json',

      success: function (response, textStatus) {
        $('#todo-list').empty();
        $(response.tasks).each(function(index, element) {
          if (element.completed === false) {
            var newToDo = 
            `<div class="todo-item row" data-id="${element.id}">
              <div class="col-xs-12">
                <div class="row show-todo-item">
                  <input type="checkbox" class="toggle col-xs-1" data-id="${element.id}" ${(element.completed ? 'checked' : '')}>
                  <label class="col-xs-10">${element.content}</label>
                  <button class="destroy btn btn-danger">
                  <span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
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

  // Show loading animation when the first Ajax request begins. 
  $(document).ajaxStart(function() {
    $('#loader').show();
  });

  // Fade out loading animation when all Ajax requests have completed
  $(document).ajaxStop(function() {
    $('#loader').fadeOut();
  });

  getAndDisplayAllTasks();
});



