function sortPrice(val) {
    console.log('hiiiii', val);
    var queryString = window.location.search;

    var params = new URLSearchParams(queryString);
    params.delete('sort');

    params.append('sort', val);

    var newQueryString = params.toString();
    var newUrl = `/shopPage?${newQueryString}`;

    console.log(newUrl);
    window.location.href = newUrl;
}

 