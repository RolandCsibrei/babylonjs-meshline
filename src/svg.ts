
'use strict'
import { ArcRotateCamera, Color3, Mesh, Scene, Texture, Vector2, Vector3 } from "@babylonjs/core";
import { GreasedLine, LineBuilder } from "./LineBuilder";
import SvgParser from "svg-path-parser"

var colors = [
    0xed6a5a,
    0xf4f1bb,
    0x9bc1bc,
    0x5ca4a9,
    0xe6ebe0,
    0xf0b67f,
    0xfe5f55,
    0xd6d1b1,
    0xc7efcf,
    0xeef5db,
    0x50514f,
    0xf25f5c,
    0xffe066,
    0x247ba0,
    0x70c1b3
];

// var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
// var svg = new THREE.Object3D();
// scene.add( svg );

// init()
// render();

interface Country {
    name: string
    positions: number[]
}


export function svgDemo(scene: Scene) {
    const engine = scene.getEngine()
    const map = new Texture('assets/stroke.png')

    readSVG().then(s => {
        drawSVG(s)

        const camera = scene.activeCamera as ArcRotateCamera

        // camera.target = new Vector3(620, 390, 0)
    })

    function makeLine(name: string, points: Float32Array) {

        const gl = LineBuilder.CreateGreasedLine(name, scene, {
            points,
            map,
            useMap: false,
            color: new Color3(colors[3]),
            opacity: 1,
            resolution: new Vector2(engine.getRenderWidth(), engine.getRenderHeight()),
            sizeAttenuation: false,
            lineWidth: 4,
            // depthWrite: false,
            // depthTest: false,
            // transparent: true

        })

        return gl


    }

    function readSVG(): Promise<string> {

        return new Promise(function (resolve, reject) {
            var ajax = new XMLHttpRequest();
            ajax.open("GET", "assets/worldLow.svg", true);
            ajax.send();
            ajax.addEventListener('load', function (e) {
                resolve(ajax.responseText);
            });
        });

    }

    function drawSVG(source: string) {

        var positions: Country[] = [];
        var parser = new DOMParser();
        var doc = parser.parseFromString(source, "image/svg+xml");


        let x: number, y: number, ox: number, oy: number, px: number, py: number

        var pathNodes = doc.querySelectorAll('path');
        pathNodes.forEach(pathNode => {

            const path = pathNode.getAttribute("d")!
            const parsed = SvgParser.parseSVG(path)
            let pos: Country

            function addPos(x: number, y: number) {
                pos.positions.push(x, y, 0)
            }

            parsed.forEach(segment => {
                if (segment.code === 'M') {

                    x = segment.x;
                    y = segment.y;
                    ox = x;
                    oy = y;
                    if (pos) {
                        positions.push(pos)
                    }

                    pos = {
                        name: pathNode.id,
                        positions: []
                    }

                    addPos(x, y)
                } else if (segment.code === "l") {
                    x = px + segment.x
                    y = py + segment.y;
                    addPos(x, y)
                } else if (segment.code === "L") {
                    x = segment.x
                    y = segment.y;
                    addPos(x, y)
                } else if (segment.code === "v") {
                    x = px;
                    y = py + segment.y;
                    addPos(x, y)
                    // line.vertices.push( new THREE.Vector3( x, y, 0 ) );
                } else if (segment.code === "h") {
                    x = px + segment.x;
                    y = py;
                    addPos(x, y)
                    // line.vertices.push( new THREE.Vector3( x, y, 0 ) );
                } else if (segment.code === "H") {
                    x = segment.x;
                    y = py;
                    addPos(x, y)
                } else if (segment.code === "V") {
                    x = px;
                    y = segment.y;
                    addPos(x, y)
                } else if (segment.command === 'closepath') {
                    x = ox;
                    y = oy;
                    addPos(x, y)
                    // add line
                    positions.push(pos)
                }
                px = x;
                py = y;
            })


        })

        const greasedLines: GreasedLine[] = []
        positions.forEach(function (c) {
            const greasedLine = makeLine(c.name, new Float32Array(c.positions));
            greasedLines.push(greasedLine)
        })

        // const ids = [...new Set( positions.map(p=>p.name))]
        // ids.forEach(id => {
        //     const greasedLinesFiltered = greasedLines.filter(b => b.name === id).map(b => b.mesh)
        //     Mesh.MergeMeshes(greasedLinesFiltered)
        // })

        Mesh.MergeMeshes(greasedLines.map(gl => gl.mesh))

    }


    // onWindowResize();

    // function onWindowResize() {

    //     var w = container.clientWidth;
    //     var h = container.clientHeight;

    //     camera.aspect = w / h;
    //     camera.updateProjectionMatrix();

    //     renderer.setSize(w, h);

    //     resolution.set(w, h);

    // }

    // window.addEventListener('resize', onWindowResize);

}