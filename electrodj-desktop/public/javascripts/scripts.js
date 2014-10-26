$(function(){
	$("#buttonRequest").on("click", function(){
		var title = $("#inputTitle").val();
		var artist = $("#inputArtist").val();
		$.get("/request?songTitle=" + title + "&songArtist=" + artist).done(function(response){
			$("#alertMessage").html(response.message);
			$("#alertMessage").removeClass("hidden");
		});
	});
});