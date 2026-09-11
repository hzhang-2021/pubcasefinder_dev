$('#vgp-user-btn-edit').click(() => {
  $('#vgp-user-input-table-wrapper').hide();
  $('#vgp-user-input-input-wrapper').show();
  $('#vgp-user-btn-edit').hide();
  $('#vgp-user-btn-delete').hide();
  $('#vgp-user-btn-save').show();
  $('#vgp-user-btn-cancel').show();
})

$('#vgp-user-btn-cancel').click(() => {
  $('#vgp-user-input-table-wrapper').show();
  $('#vgp-user-input-input-wrapper').hide();
  $('#vgp-user-btn-edit').show();
  $('#vgp-user-btn-delete').show();
  $('#vgp-user-btn-save').hide();
  $('#vgp-user-btn-cancel').hide();
});

function _isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

$('#vgp-user-btn-save').click(() => {

  let isPassed = true;
  document.querySelectorAll(".vgp-user-input-input.for-check").forEach(function (input) {
    let $input = $(input);
    if($input.hasClass("notempty")){
      if (!input.value.trim()) {
        isPassed = false;
        $input.addClass("notpassed");
      } else {
        $input.removeClass("notpassed");
      }
    }else if($input.hasClass("email")){
      if(!_isValidEmail(input.value.trim())){
        isPassed = false;
        $input.addClass("notpassed");
      }else{
        $input.removeClass("notpassed");
      }
    }else{
      alert("unknown check item " + input.id);
    }
  });

  if(!isPassed){
    return;
  }

  let form = document.getElementById('vgp-user-form');
  let formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  fetch('/google_user_save', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      // Reload the page on success
      location.reload();
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An unexpected error occurred.' + error);
  });
});

$('#deleteModal').on('show.bs.modal', function () {
  $('#errorMessage').hide();
  $('#confirmEmail').val("");
});


$('#deleteModal').on('shown.bs.modal', function () {
  $('#confirmEmail').trigger('focus');
});

function confirmDelete() {
  const originalEmail = document.getElementById('originalEmail').value;
  const confirmEmail = document.getElementById('confirmEmail').value;

  if (originalEmail === confirmEmail) {

    document.body.style.cursor = "wait";
    const btn = document.getElementById("submitDeleteBtn");
    btn.disabled = true;
    btn.innerText = "Processing...";
    $(btn).addClass('disabled');

    const data = {};
    let service = $('#in-user-service').val();
    data.service = service;
    data.account = $('#in-user-account').val();
    data.uid = $('#in-user-uid').val();

    fetch('/google_user_delete', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.body.style.cursor = "";
        btn.innerText = "Delete";
        btn.disabled = false;
        $(btn).removeClass('disabled');

        alert(data.error);
      } else {
        // Reload the page on success
        window.location.href = `/google_user_logout?service=${service}`;
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An unexpected error occurred.' + error);
    });




  } else {
    document.getElementById('errorMessage').style.display = 'block';
    $('#confirmEmail').trigger('focus');
  }
}
