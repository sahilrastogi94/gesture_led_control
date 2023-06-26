import { Hands as _Hands, HAND_CONNECTIONS as _HAND_CONNECTIONS } from '@mediapipe/hands'
import { drawConnectors as _drawConnectors, drawLandmarks as _drawLandmarks} from '@mediapipe/drawing_utils'

const Hands = _Hands || window.Hands;
const HAND_CONNECTIONS = _HAND_CONNECTIONS || window.HAND_CONNECTIONS;
const drawConnectors = _drawConnectors || window.drawConnectors;
const drawLandmarks = _drawLandmarks || window.drawLandmarks;

var knnClassifier;
export var handsModel;
export var hands = [];
export var exampleAdded = false;
export var labelAI = "example";

export function setup() {
    knnClassifier = window.ml5.KNNClassifier();
    handsModel = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});
    handsModel.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.5
    });
    handsModel.onResults(gotHands);
}

function gotHands(results) {
    hands = results;
}

export function drawHandLandmarksAndConnectors(ctx) {
    for (const landmarks of hands.multiHandLandmarks) {
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
        drawLandmarks(ctx, landmarks, {color: '#FF0000', lineWidth: 2});
    }
};

export async function addExample(label) {
    if(hands.multiHandLandmarks.length) {
        const handsArray = [];
        for(let i = 0; i < hands.multiHandLandmarks.length; i += 1) {
            for(let j = 0; j < 21; j += 1) {
                let landmark = hands.multiHandLandmarks[i][j];
                handsArray.push([landmark.x, landmark.y]);
            }
        }
        await knnClassifier.addExample(handsArray, label);
        exampleAdded = true;
    }
}

export function classify() {
    const handsArray = [];
    for (let i = 0; i < hands.multiHandLandmarks.length; i += 1) {
        for (let j = 0; j < 21; j += 1) {
            let landmark = hands.multiHandLandmarks[i][j];
            if(landmark) {
                handsArray.push([landmark.x, landmark.y]);
            }
        }
    }
    try {
        if(handsArray.length != 0) {
            knnClassifier.classify(handsArray, gotResults);
        }
    } catch (error) {

    }
}

function gotResults(err, result) {
    if(err) {
        console.error(err);
    } else {
        if(result.confidencesByLabel) {
            if(result.label) {
                const entries = Object.entries(result.confidencesByLabel);
                let greatestConfidence = entries[0];
                for(let i = 0; i < entries.length; i++) {
                    if(entries[i][1] > greatestConfidence[1]) {
                        greatestConfidence = entries[i];
                    }
                }
                labelAI = greatestConfidence[0];
            }
        }
    }
}