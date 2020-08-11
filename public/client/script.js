// DOM elements needed for client side
let body = document.querySelector("body");
let tableDiv = document.querySelector(".workout-table-div");
let formDiv = document.querySelector(".form-div");

// add click event for various buttons in DOM
body.addEventListener("click", event => {
  event.preventDefault();
  if (event.target.className === "add-button") {
    // if name or date is missing don't submit
    if (formNotValid()) {
      alert("Name of exercise and date is required.");
      return;
    }
    // create new xml http request
    let req = new XMLHttpRequest();
    // submit a POST request
    // change URL to where server is hosted, when finished
    // http://flip3.engr.oregonstate.edu:64779
    req.open("POST", "http://flip3.engr.oregonstate.edu:64779", true);
    // set header for request
    req.setRequestHeader("Content-Type", "application/json");
    // set load event and pass createForm and createTable into callback
    req.addEventListener("load", function() {
      if (req.status >= 200 && req.status < 400) {
        let data = JSON.parse(req.response);
        // recreate form and recreateTable
        recreateForm();
        recreateTable(data);
      } else {
        alert("Server side error, please try again.");
      }
    });
    // send data
    req.send(JSON.stringify(createNewExercise()));
  }
  // event for edit button
  else if (event.target.className === "edit-button") {
    // get rowID
    let rowID = event.target.previousSibling.value;
    // list of siblings to get data.
    let siblingList = event.target.parentNode.parentNode.parentNode.children;
    // create new form with data of that row.
    editForm(rowID, siblingList);
  } else if (event.target.className === "change-button") {
    // if name or date is missing don't submit
    if (formNotValid()) {
      alert("Name of exercise and date is required.");
      return;
    }
    // create new xml http request
    let req = new XMLHttpRequest();
    // submit a POST request
    req.open("POST", "http://flip3.engr.oregonstate.edu:64779", true);
    req.setRequestHeader("Content-Type", "application/json");
    // event listener for load event
    req.addEventListener("load", function() {
      if (req.status >= 200 && req.status < 400) {
        let data = JSON.parse(req.response);
        // recreate form and recreateTable
        recreateForm();
        recreateTable(data);
      } else {
        alert("Server side error, please try again.");
      }
    });
    let formatted = createNewExercise("id");
    formatted.edit = "edit";
    // send data
    req.send(JSON.stringify(formatted));
  } else if (event.target.className === "delete-button") {
    // get rowID
    let rowID = event.target.previousSibling.previousSibling.value;
    // create new xml http request
    let req = new XMLHttpRequest();
    // send request to /delete
    // // http://flip3.engr.oregonstate.edu:64779
    req.open("POST", "http://flip3.engr.oregonstate.edu:64779", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener("load", function() {
      if (req.status >= 200 && req.status < 400) {
        let data = JSON.parse(req.response);
        // recreate form and recreateTable
        recreateForm();
        recreateTable(data);
      } else {
        alert("Server side error, please try again.");
      }
    });
    // send data over
    req.send(JSON.stringify({ id: rowID, delete: "delete" }));
  }
});

// helper function to format date
function formatDate(date, style) {
  let arrayForm = date.split("-");
  if (style === "server") {
    // mariaDB takes date in form of YYYY-MM-DD
    return arrayForm[2] + "-" + arrayForm[0] + "-" + arrayForm[1];
  }
  // else format date for client side, mm-dd-yyy
  return arrayForm[1] + "-" + arrayForm[2] + "-" + arrayForm[0];
}

// helper function to format data.
function createNewExercise(id) {
  //data from dom
  if (id) {
    return {
      id: document.querySelector(".hidden-input").value,
      name: document.querySelector(".name").value,
      reps: document.querySelector(".reps").value,
      weight: document.querySelector(".weight").value,
      date: formatDate(document.querySelector(".date").value, "server"),
      unit: document.querySelector(".unit").value
    };
  }
  return {
    create: "create",
    name: document.querySelector(".name").value,
    reps: document.querySelector(".reps").value,
    weight: document.querySelector(".weight").value,
    date: formatDate(document.querySelector(".date").value, "server"),
    unit: document.querySelector(".unit").value
  };
}

// function to see if form is complete
function formNotValid() {
  // get the name and date field
  let nameField = document.querySelector(".name").value;
  let dateField = document.querySelector(".date").value;
  //if name or date field is empty, return true, else false
  if (nameField === "") {
    return true;
  }

  if (!dateField) {
    return true;
  }
  return false;
}

// function to recreate table for user data
function recreateTable(userData) {
  // remove the table
  let tableDivChildren = tableDiv.children;
  tableDiv.removeChild(tableDivChildren[1]);

  // object to contain table header data
  let tableHeaderData = {
    0: "Name of exercise",
    1: "Reps",
    2: "Weight",
    3: "Date",
    4: "Unit",
    5: "Edit or delete workout"
  };

  // recreate table
  let newTable = document.createElement("table");

  // table header
  let tableHead = document.createElement("thead");
  let tableHeadRow = document.createElement("tr");

  // create column of header
  for (let key in tableHeaderData) {
    let tableColumn = document.createElement("th");
    tableColumn.innerText = tableHeaderData[key];
    tableHeadRow.appendChild(tableColumn);
  }

  // append row to tableHead and tableHead to table
  tableHead.appendChild(tableHeadRow);
  newTable.appendChild(tableHead);

  // table body
  let tableBody = document.createElement("tbody");

  // loop through the data and create rows
  for (let data of userData) {
    let bodyRow = document.createElement("tr");
    // get data and make table data
    let nameCol = document.createElement("td");
    nameCol.innerText = data.name;
    let repCol = document.createElement("td");
    repCol.innerText = data.reps;
    let weightCol = document.createElement("td");
    weightCol.innerText = data.weight;
    let dateCol = document.createElement("td");
    dateCol.innerText = formatDate(
      data.date.slice(0, data.date.indexOf("T")),
      "client"
    );
    let unitCol = document.createElement("td");
    unitCol.innerText = data.lbs;

    // button column and form
    let buttonColumn = document.createElement("td");
    let rowForm = document.createElement("form");

    // add class to form
    rowForm.classList.add("row-form");

    // create buttons and hidden input
    let hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("value", data.id);
    let editButton = document.createElement("input");
    editButton.setAttribute("type", "Submit");
    editButton.setAttribute("value", "Edit");
    editButton.classList.add("edit-button");
    let deleteButton = document.createElement("input");
    deleteButton.setAttribute("type", "Submit");
    deleteButton.setAttribute("value", "Delete");
    deleteButton.classList.add("delete-button");

    // append to form
    rowForm.appendChild(hiddenInput);
    rowForm.appendChild(editButton);
    rowForm.appendChild(deleteButton);

    // append to buttonColumn
    buttonColumn.appendChild(rowForm);

    // append data to row
    bodyRow.appendChild(nameCol);
    bodyRow.appendChild(repCol);
    bodyRow.appendChild(weightCol);
    bodyRow.appendChild(dateCol);
    bodyRow.appendChild(unitCol);
    bodyRow.appendChild(buttonColumn);

    // append row to body
    tableBody.appendChild(bodyRow);
  }
  // append table body to table
  newTable.appendChild(tableBody);
  // append table to div
  tableDiv.appendChild(newTable);
}

// function to recreate form to add new workouts
function recreateForm() {
  // remove form and recreate
  let form = formDiv.firstElementChild;
  formDiv.removeChild(form);

  // new form
  let newForm = document.createElement("form");
  // add fieldset to form
  let fieldSet = document.createElement("fieldset");

  // add legend to fieldset
  let legend = document.createElement("legend");
  legend.innerText = "Enter your new workout";
  legend.classList.add("form-header");
  fieldSet.appendChild(legend);

  // create exercise label and input then append to fieldset
  let exerciseLabel = document.createElement("label");
  exerciseLabel.innerText = "Name of the exercise: ";
  let exerciseInput = document.createElement("input");
  exerciseInput.setAttribute("type", "text");
  exerciseInput.setAttribute("name", "name");
  exerciseInput.classList.add("name");
  fieldSet.appendChild(exerciseLabel);
  fieldSet.appendChild(exerciseInput);
  fieldSet.appendChild(document.createElement("br"));

  // create rep label and input then append to fieldset
  let repLabel = document.createElement("label");
  repLabel.innerText = "Number of Reps: ";
  let repInput = document.createElement("input");
  repInput.setAttribute("type", "number");
  repInput.setAttribute("name", "reps");
  repInput.classList.add("reps");
  fieldSet.appendChild(repLabel);
  fieldSet.appendChild(repInput);
  fieldSet.appendChild(document.createElement("br"));

  // create weight label and input, append to fieldset
  let weightLabel = document.createElement("label");
  weightLabel.innerText = "Weight of the exercise: ";
  let weightInput = document.createElement("input");
  weightInput.setAttribute("type", "text");
  weightInput.setAttribute("name", "weight");
  weightInput.classList.add("weight");
  fieldSet.appendChild(weightLabel);
  fieldSet.appendChild(weightInput);
  fieldSet.appendChild(document.createElement("br"));

  // create date label and input, append to fieldset
  let dateLabel = document.createElement("label");
  dateLabel.innerText = "Date exercise was done: ";
  let dateInput = document.createElement("input");
  dateInput.setAttribute("type", "text");
  dateInput.setAttribute("name", "date");
  dateInput.setAttribute("placeholder", "mm-dd-yyyy");
  dateInput.classList.add("date");
  fieldSet.appendChild(dateLabel);
  fieldSet.appendChild(dateInput);
  fieldSet.appendChild(document.createElement("br"));

  // create unit label and input, append to fieldset
  let unitLabel = document.createElement("label");
  unitLabel.innerText = "Enter 0 if in lbs, 1 if in kg ";
  let unitInput = document.createElement("input");
  unitInput.setAttribute("type", "text");
  unitInput.setAttribute("name", "unit");
  unitInput.classList.add("unit");
  fieldSet.appendChild(unitLabel);
  fieldSet.appendChild(unitInput);
  fieldSet.appendChild(document.createElement("br"));

  // create submit button, append to fieldset
  let submitButton = document.createElement("input");
  submitButton.setAttribute("type", "submit");
  submitButton.setAttribute("value", "Submit");
  submitButton.classList.add("add-button");
  fieldSet.appendChild(submitButton);

  // append fieldset to form
  newForm.appendChild(fieldSet);

  // append form to the parent div
  formDiv.appendChild(newForm);
}

// edit the form
function editForm(id, data) {
  // remove form and recreate
  let form = formDiv.firstElementChild;
  formDiv.removeChild(form);

  // new form
  let newForm = document.createElement("form");
  // add fieldset to form
  let fieldSet = document.createElement("fieldset");

  // add legend to fieldset
  let legend = document.createElement("legend");
  legend.innerText = "Edit your workout";
  legend.classList.add("form-header");
  fieldSet.appendChild(legend);

  // create exercise label and input then append to fieldset
  let exerciseLabel = document.createElement("label");
  exerciseLabel.innerText = "Name of the exercise: ";
  let exerciseInput = document.createElement("input");
  exerciseInput.setAttribute("type", "text");
  exerciseInput.setAttribute("name", "name");
  exerciseInput.classList.add("name");
  exerciseInput.value = data[0].innerText;
  fieldSet.appendChild(exerciseLabel);
  fieldSet.appendChild(exerciseInput);
  fieldSet.appendChild(document.createElement("br"));

  // create rep label and input then append to fieldset
  let repLabel = document.createElement("label");
  repLabel.innerText = "Number of Reps: ";
  let repInput = document.createElement("input");
  repInput.setAttribute("type", "number");
  repInput.setAttribute("name", "reps");
  repInput.classList.add("reps");
  repInput.value = data[1].innerText;
  fieldSet.appendChild(repLabel);
  fieldSet.appendChild(repInput);
  fieldSet.appendChild(document.createElement("br"));

  // create weight label and input, append to fieldset
  let weightLabel = document.createElement("label");
  weightLabel.innerText = "Weight of the exercise: ";
  let weightInput = document.createElement("input");
  weightInput.setAttribute("type", "text");
  weightInput.setAttribute("name", "weight");
  weightInput.classList.add("weight");
  weightInput.value = data[2].innerText;
  fieldSet.appendChild(weightLabel);
  fieldSet.appendChild(weightInput);
  fieldSet.appendChild(document.createElement("br"));

  // create date label and input, append to fieldset
  let dateLabel = document.createElement("label");
  dateLabel.innerText = "Date exercise was done: ";
  let dateInput = document.createElement("input");
  dateInput.setAttribute("type", "text");
  dateInput.setAttribute("name", "date");
  dateInput.setAttribute("placeholder", "yyyy-mm-dd");
  dateInput.classList.add("date");
  dateInput.value = data[3].innerText;
  fieldSet.appendChild(dateLabel);
  fieldSet.appendChild(dateInput);
  fieldSet.appendChild(document.createElement("br"));

  // create unit label and input, append to fieldset
  let unitLabel = document.createElement("label");
  unitLabel.innerText = "Enter 0 if in lbs, 1 if in kg ";
  let unitInput = document.createElement("input");
  unitInput.setAttribute("type", "text");
  unitInput.setAttribute("name", "unit");
  unitInput.classList.add("unit");
  unitInput.value = data[4].innerText;
  fieldSet.appendChild(unitLabel);
  fieldSet.appendChild(unitInput);
  fieldSet.appendChild(document.createElement("br"));

  // add hidden input and append
  let hiddenInput = document.createElement("input");
  hiddenInput.setAttribute("type", "hidden");
  hiddenInput.value = id;
  hiddenInput.classList.add("hidden-input");
  fieldSet.appendChild(hiddenInput);

  // create submit button, append to fieldset
  let submitButton = document.createElement("input");
  submitButton.setAttribute("type", "submit");
  submitButton.setAttribute("value", "Change");
  submitButton.classList.add("change-button");
  fieldSet.appendChild(submitButton);

  // append fieldset to form
  newForm.appendChild(fieldSet);

  // append form to the parent div
  formDiv.appendChild(newForm);

  // focus on the first input
  exerciseInput.focus();
}
