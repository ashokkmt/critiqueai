window.addEventListener("beforeunload", function () {
    navigator.sendBeacon("/delete-user-files");
});
