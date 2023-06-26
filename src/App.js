import { useEffect } from 'react';
import './App.css';
import { handsModel, hands, exampleAdded, labelAI, setup, drawHandLandmarksAndConnectors, addExample, classify } from './handsDetection';
import { isConnected, connectBT, sendData } from './webBle';
export default function App() {
  let video;
  let oneData = 0, twoData = 0, threeData = 0, fourData = 0, fiveData = 0, stopData = 0;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function addOne() {
    await addExample("one");
    oneData += 1;
    document.getElementById("oneCount").innerText = oneData;
  }

  async function addTwo() {
    await addExample("two");
    twoData += 1;
    document.getElementById("twoCount").innerText = twoData;
  }

  async function addThree() {
    await addExample("three");
    threeData += 1;
    document.getElementById("threeCount").innerText = threeData;
  }

  async function addFour() {
    await addExample("four");
    fourData += 1;
    document.getElementById("fourCount").innerText = fourData;
  }

  async function addFive() {
    await addExample("five");
    fiveData += 1;
    document.getElementById("fiveCount").innerText = fiveData;
  }

  async function addStop() {
    await addExample("stop");
    stopData += 1;
    document.getElementById("stopCount").innerText = stopData;
  }

  function waitForElement(querySelector, timeout = 0) {
    const startTime = new Date().getTime();
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        if (document.querySelector(querySelector)) {
          clearInterval(timer);
          resolve();
        } else if (timeout && now - startTime >= timeout) {
          clearInterval(timer);
          reject();
        }
      }, 100);
    });
  }

  const startProject = () => {
    const handsCanvas = document.getElementsByClassName("videoFeed")[0];
    const handsCanvasCtx = handsCanvas.getContext("2d");
    video = document.getElementsByClassName("videoFeed")[1];
    
    async function loop() {
      handsCanvasCtx.drawImage(video, 0, 0, 640, 480)
      await handsModel.send({ image: handsCanvas });
      if(hands.multiHandLandmarks) {
        drawHandLandmarksAndConnectors(handsCanvasCtx, hands);
        if(exampleAdded) {
          classify();
          document.getElementById("labelAI").innerText = labelAI;
          if(isConnected) {
            sendData(labelAI);
          }
        }
      }
      window.requestAnimationFrame(loop);
    }

    setup();
    navigator.getUserMedia(
      { video: { deviceId: 'ec7219297c17fd9eb4d11fb52e0d98165c003c72f0ac8b87a064678c4b248ed1' } },
      (stream) => {
        if (video) {
          if (!video.srcObject) {
            video.srcObject = stream;
            video.play();
          }
        }
      },
      (err) => console.error(err)
    );
    video.addEventListener("loadeddata", async function temp() {
      await handsModel.send({ image: video });
      loop();
      video.removeEventListener("loadeddata", temp);
    });
  }

  useEffect( () => {
    waitForElement("#handsCanvas", 3000).then(() => {
      startProject()
    });
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        {/* <h1>MEDIAPIPE HANDS</h1> */}
        <button className="button-37" role="button" id="connectBT" onClick={connectBT}>Connect</button>
        <button className="button-38" role="button" onClick={addOne}>One</button> 
        <button className="button-38" role="button" onClick={addTwo}>Two</button> 
        <button className="button-38" role="button" onClick={addThree}>Three</button>
        <button className="button-38" role="button" onClick={addFour}>Four</button>
        <button className="button-38" role="button" onClick={addFive}>Five</button>
        <button className="button-38" role="button" onClick={addStop}>Stop</button>
        <p></p>
        <span id="oneCount">0</span>
        <span>,</span>
        <span id="twoCount">0</span>
        <span>,</span>
        <span id="threeCount">0</span>
        <span>,</span>
        <span id="fourCount">0</span>
        <span>,</span>
        <span id="fiveCount">0</span>
        <span>,</span>
        <span id="stopCount">0</span>
        <p id="labelAI"></p>
        <canvas id = "handsCanvas" className="videoFeed" height="480" width="640"></canvas>'
        <video className="videoFeed" style={{ display: "none" }} height="480" width="640" muted autoPlay />
      </header>
    </div>
  );
}