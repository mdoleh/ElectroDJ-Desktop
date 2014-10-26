$(function(){
	$("#buttonRequest").on("click", function(){
		var title = $("#inputTitle").val();
		var artist = $("#inputArtist").val();
		$.get("/request?songTitle=" + title + "&songArtist=" + artist).done(function(){
			
		});
	});
});