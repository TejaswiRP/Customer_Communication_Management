function SetBookmark() {
    var SD = window.parent,
        loc = window.location.href
    ;

    SD.SetBookmark(
        loc.substring(loc.toLowerCase().lastIndexOf("/scormcontent/") + 14, loc.length),
        document.title
    );
    SD.CommitData();
}

SetBookmark();
