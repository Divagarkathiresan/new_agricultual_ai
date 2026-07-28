# Smart-Agriculture-Advisory-using-AI

## Run the Backend for Expo

Start FastAPI from the `backend` folder so it is reachable from Expo Go on a phone:

```bash
cd backend
python3 run.py
```

The API will listen on `0.0.0.0:8000`. If Expo shows a URL like
`http://192.168.0.2:8000`, keep your phone and computer on the same Wi-Fi network
and make sure your firewall allows incoming connections on port `8000`.
