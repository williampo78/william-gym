$(document).ready(function () {
  $(".card").slice(0, 3).show();
  $("#loadMore").on("click", function (e) {
    e.preventDefault();
    $(".card:hidden").slice(0, 3).slideDown();
    if ($(".card:hidden").length == 0) {
      $("#loadMore").text("沒有更多內容").addClass("noContent");
    }
    if ($(".card:hidden").length == 0) {
      $("#load").fadeOut("slow");
    }
    $("html,body").animate(
      {
        scrollTop: $(this).offset().top,
      },
      1500
    );
  });

  $("#book-now").click(function () {
    $("#book-now").text("預約成功").attr("disabled", true);
  });

  // $("#login-first").click(function () {
  //   $("#login-first").append("<a href='#'>Hi</a>");
  // });
});
