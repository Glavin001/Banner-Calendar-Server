// 
$('#form-signin').submit(function(e){
  e.preventDefault();
  var data = $("#form-signin").serialize();
  console.log(data);
  $.ajax({
    method: "POST",
    url: '/api/updateUser',
    data: data,
    success: function(data)
    {
      //callback methods go right here
      console.log(data);

      var $userInfo = $('.user-info');
      $userInfo.html(JSON.stringify(data,null,4));
      $('#user-calendar-url').attr('href', data.url).text(data.url);

    }
  });
});