$(document).ready(function() {
    $('.how-to-play-btn').on('click', function() {
        $('#howToPlayPopup').show();
    });

    $('.close-btn').on('click', function() {
        $('#howToPlayPopup').hide();
    });

    $('.play-btn').on('click', function() {
        window.location.href = '/pages/fases/fase1.html';
    });
});