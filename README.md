To run the frontend use these commands in terminal :
```bash
cd frontend
nvm use 20
npx expo start
npx expo start --dev-client --lan --clear
```

To run the backend use these commands in the terminal :
MacOS / Linux
```bash
cd backend
python3 run.py
```

```bash
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```