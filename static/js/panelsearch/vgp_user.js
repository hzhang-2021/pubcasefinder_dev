$('#vgp-user-btn-edit').click(() => {

  $('#vgp-user-input-table-wrapper').hide();
  $('#vgp-user-input-input-wrapper').show();
  $('#vgp-user-btn-edit').hide();
  $('#vgp-user-btn-save').show();
  $('#vgp-user-btn-cancel').show();
})

$('#vgp-user-btn-cancel').click(() => {
  $('#vgp-user-input-table-wrapper').show();
  $('#vgp-user-input-input-wrapper').hide();
  $('#vgp-user-btn-edit').show();
  $('#vgp-user-btn-save').hide();
  $('#vgp-user-btn-cancel').hide();
})

$('#vgp-user-btn-save').click(() => {
  let email = $('#i_email').val();
  let firstname   = $('#i_firstname').val();
  let lastname    = $('#i_lastname').val();
  let affiliation = $('#i_affiliation').val();
  let role        = $('#i_role').val();
  let group       = $('#i_group').val();

  let val_lst_array = [
    {id:"i_firstname",   val:firstname,   check: 'notempty'},
    {id:"i_lastname",    val:lastname,    check: 'notempty'},
    {id:"i_affiliation", val:affiliation, check: 'notempty'},
    {id:"i_role",        val:role,        check: 'positive'},
    {id:"i_group",       val:group,       check: 'positive'}
  ];

  let isPassed = true;
  let i=0;
  for(;i<val_lst_array.length;i++){

    if(val_lst_array[i].check === 'notempty'){
      if(val_lst_array[i].val.length === 0){
        isPassed = false;
        break;
      }	
    }else{
      //check if positive
      if(val_lst_array[i].val < 1){
        isPassed = false;
        break;
      }
    }
  }

  if(!isPassed){
    $('#'+val_lst_array[i].id).focus();
    return;
  }

  $('#vgp-user-form').submit();
})


