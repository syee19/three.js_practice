import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";

let basisDir = 1;

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.sortObjects = false;

  const fov = 70;
  const aspect = 1;
  const near = 0.1;
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 4.5;
  //camera.position.x = 4.5;
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x717171, 1, 6.5);
  //scene.background = new THREE.Color(0x171717);

  let cdist = 1.2; //바닥 깊이

  const planeWidth = 2.9 / 4;
  const planeHeight = 5.7 / 4;
  const pgeo = new THREE.PlaneGeometry(planeWidth, planeHeight);

  const loader = new THREE.TextureLoader();

  function makeInstance(pgeo, url, xpos, zpos) {
    const texture = loader.load(url, render);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0,
      transparent: true,
      fog: false,
    });

    const mesh = new THREE.Mesh(pgeo, material);
    scene.add(mesh);
    mesh.position.x = xpos;
    mesh.position.y = -cdist + planeHeight / 2 - zpos / 10;
    mesh.position.z = zpos;
  }

  makeInstance(pgeo, "./sample.png", -1.2, -1);
  // makeInstance(pgeo, "./sample.png", 0, -1);
  // makeInstance(pgeo, "./sample.png", 1.2, -1);
  // makeInstance(pgeo, "./sample.png", -0.6, 0);
  // makeInstance(pgeo, "./sample.png", 0.6, 0);
  // makeInstance(pgeo, "./sample.png", -1.2, 1);
  // makeInstance(pgeo, "./sample.png", 0, 1);
  makeInstance(pgeo, "./sample.png", 1.2, 1);

  const geometry = new THREE.SphereGeometry(2.5, 32, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0x4d4e6a,
    transparent: true,
    opacity: 0.05,
  });
  const snowBall = new THREE.Mesh(geometry, material);
  scene.add(snowBall);

  let rad = Math.sqrt(Math.pow(2.5, 2) - Math.pow(cdist, 2));
  const cgeo = new THREE.CircleGeometry(rad, 32);
  const cmat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(cgeo, cmat);
  let cang = (5 / 180) * Math.PI;
  plane.position.y = -cdist * Math.cos(cang);
  plane.position.z = -cdist * Math.sin(cang);
  plane.lookAt(0, 0, 0);
  scene.add(plane);

  // mesh 생성 함수
  function addShape(x, y, z) {
    //star shape (*)
    const shape = new THREE.Shape()
      .moveTo(3, 5)
      .lineTo(3, 21)
      .lineTo(-3, 21)
      .lineTo(-3, 5)
      .lineTo(-17, 13)
      .lineTo(-20, 8)
      .lineTo(-6, 0)
      .lineTo(-20, -8)
      .lineTo(-17, -13)
      .lineTo(-3, -5)
      .lineTo(-3, -21)
      .lineTo(3, -21)
      .lineTo(3, -5)
      .lineTo(17, -13)
      .lineTo(20, -8)
      .lineTo(6, 0)
      .lineTo(20, 8)
      .lineTo(17, 13)
      .lineTo(3, 5); // close path

    //scale 조정
    var s = 0.005;
    let geometry = new THREE.ShapeGeometry(shape);

    let mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: 0x555555, //0x5b8d80,

        side: THREE.DoubleSide,
      })
    );
    mesh.position.set(x, y, z);
    mesh.scale.set(s, s, s);
    scene.add(mesh);
    return mesh;
  }

  //원점 주변에 일정 간격으로 랜덤하게 * mesh 생성
  var arr = [];
  var velo = [];
  var n = 50;
  const seta = (Math.PI * 2) / n;
  var len, shx, shy, shz;
  var pm = 1;
  for (var i = 0; i < n; i++) {
    len = Math.random() * 0.4 + 0.6;
    shx = len * Math.sin(i * seta);
    shy = len * Math.cos(i * seta);
    shz = Math.sqrt(1 - shx * shx - shy * shy) * pm;
    len = Math.random() * 2.3;
    arr.push(addShape(len * shx, len * shy, len * shz));
    //arr.push(addShape(0, 0, 0));
    velo.push(0.005 + Math.random() / 300);
    pm *= -1;
  }

  //중력 방향 arrowHelper
  const dir = new THREE.Vector3(0, -1, 0);
  const origin = new THREE.Vector3(0, 0, 0);
  const length = 2;
  // const hex = 0xffffff;
  // const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, 0.4);
  // scene.add(arrowHelper);

  var gx;
  var gy;
  var gz;

  // render 혹은 animate loop를 불러 렌더링하기
  function render(time) {
    if (resizeRendererToDisplaySize(renderer)) {
      camera.updateProjectionMatrix();
    }
    var w = 2;
    gx = basisDir * document.getElementById("Accelerometer_gx").innerHTML;
    gy = basisDir * document.getElementById("Accelerometer_gy").innerHTML;
    gz = basisDir * document.getElementById("Accelerometer_gz").innerHTML;
    var temp = new THREE.Vector3(gx, gy, gz);
    dir.addScaledVector(temp, w);
    //dir.set(gx, gy, gz);
    dir.normalize();

    if (dir.length() == 0) {
      dir.set(0, -1, 0);
    }

    //arrowHelper.setDirection(dir);
    //arrowHelper.setLength(dir.length());

    //* 애니메이션
    for (var i = 0; i < arr.length; i++) {
      //방법 1: 중력방향 기준으로 구 바닥쪽과 닿으면 점대칭이동
      //if (arr[i].position.y <= -2.5) arr[i].position.y = 2.5;
      // arr[i].position.x += velo[i] * dir.x;
      // arr[i].position.y += velo[i] * dir.y;
      // arr[i].position.z += velo[i] * dir.z;
      // if (getDistance(arr[i]) >= 2.3) {
      //   arr[i].position.x *= -1;
      //   arr[i].position.y *= -1;
      //   arr[i].position.z *= -1;
      // }

      //방법 2: 중력방향 기준 아래쪽 반구에서 바닥쪽과 닿으면 이동 방향을 접하는 평면위에 투사해서 미끄러지도록 함 + 속도 조절
      // var temp;
      // if (
      //   getDistance(arr[i]) >= 2.3 &&
      //   dir.angleTo(arr[i].position) < Math.PI / 2
      // ) {
      //   temp = slideDirection(arr[i], dir);
      // } else {
      //   temp = dir;
      // }
      // arr[i].position.x += velo[i] * temp.x;
      // arr[i].position.y += velo[i] * temp.y;
      // arr[i].position.z += velo[i] * temp.z;
      // arr[i].lookAt(camera.position);

      //방법 3: 일단 속도만큼 이동한 후 원점과의 거리가 구 반지름보다 크면 반지름으로 clamp한 위치로 위지를 update
      arr[i].position.x += velo[i] * dir.x;
      arr[i].position.y += velo[i] * dir.y;
      arr[i].position.z += velo[i] * dir.z;
      if (
        arr[i].position.y <
        -cdist + 0.05 - arr[i].position.z * Math.tan(cang)
      ) {
        arr[i].position.y = -cdist + 0.05 - arr[i].position.z * Math.tan(cang);
      }
      if (getDistance(arr[i]) >= 2.3) {
        arr[i].position.multiplyScalar(2.3 / getDistance(arr[i]));
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();

function slideDirection(arr, dir) {
  var pjdir = dir.clone();
  var res = new THREE.Vector3();
  res.subVectors(dir, pjdir.projectOnVector(arr.position));
  res = res.multiplyScalar(
    Math.pow(
      Math.sin(dir.angleTo(arr.position)) * 0.8,
      Math.cos(dir.angleTo(arr.position)) * 8
    )
  );
  return res;
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientWidth;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

//point와 wolrd origin 사이의 거리 반환
function getDistance(point) {
  var x2 = point.position.x * point.position.x;
  var y2 = point.position.y * point.position.y;
  var z2 = point.position.z * point.position.z;
  //dist = Math.cqrt(x2 + y2 + z2);
  var dist = Math.sqrt(x2 + y2 + z2);
  return dist;
}
