import random
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/image', methods=['POST'])
def predict_image():
    classes = ["Ripe", "Unripe", "Overripe", "Rotten"]
    selected_class = random.choice(classes)
    # Generate low confidence sometimes to test "Unknown" threshold
    confidence = round(random.uniform(0.40, 0.99), 4)

    return jsonify({
        "id": "mock-1234",
        "project": "mock-project",
        "iteration": "mock-iteration",
        "created": "2026-06-07T00:00:00.000Z",
        "predictions": [
            {
                "probability": confidence,
                "tagId": "mock-tag-id",
                "tagName": selected_class
            }
        ]
    })

if __name__ == '__main__':
    print("Mock AI Model is running on http://127.0.0.1:5001/image")
    app.run(host='0.0.0.0', port=5001)
