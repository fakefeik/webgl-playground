function load(filename) {
    var request = new XMLHttpRequest();
    request.open('GET', filename, false);
    request.send();
    var mesh;
    if (request.status == 200) {
        mesh = JSON.parse(request.responseText);
        return new Mesh(gl, mesh.vertices, mesh.indices, mesh.textures, mesh.normals);
    }
    return null;
}
