import { useEffect, useRef } from "react";
import { useState } from "react";
import { TextField, Select, Box, FormControl, InputLabel, MenuItem, Snackbar, Alert } from "@mui/material";
import './style.css';
import CustomNavBar from "./Components/CustomNavBar";

const END_POINT: string = import.meta.env.VITE_API_ENDPOINT;
const API_VALUE: string = import.meta.env.VITE_API_VALUE;

function App() {
  const [wssConn, setWssConn] = useState("");
  const [period, setPeriod] = useState<number>(2);
  const [correctAPIKey, setCorrectAPIKey] = useState<boolean>(true);
  const [websocketData, setWebsocketData] = useState<string>(""); 
  const wsRef = useRef<WebSocket | null>(null);
  const [correctUpdate, setcorrectUpdate] = useState<boolean>(true);

  const selectItems = [
    { value: 2, label: 'Two'},
    { value: 5, label: 'Five'},
    { value: 10, label: 'Ten'},
  ];

  const handlePeriodChange = (value: number) => {
    fetch(END_POINT, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      "X-API-KEY"  : API_VALUE
    },
    body: JSON.stringify({ RefreshFreq: value })
  }).then((response) => {
    if (response.ok) {
      setcorrectUpdate(true);
      setPeriod(value);
      console.log('Period updated to:', value); 
      wsRef.current?.send(value.toString());

    } else {
      setCorrectAPIKey(false);
      throw new Error('Failed to set period on server');
    }
  })
  .catch((error) => {
    setCorrectAPIKey(false);
    console.error('Error setting period:', error);
  });
  };
  
  
  useEffect(() => {
    setcorrectUpdate(false);
    fetch(END_POINT, {
      method: "GET",
      headers: {
        "X-API-KEY"  : API_VALUE
      },
    }).then((response) => response.json())
      .then((data) => {
        setWssConn(data.connectionString);
        setcorrectUpdate(true);
        console.log(data);
      })
      .catch((error) => console.log(error));
      
  }, [] );

  useEffect(() => {
    if (wssConn) {
      wsRef.current = new WebSocket(wssConn);
      
      wsRef.current.onopen = () => {
        console.log("Conexión establecida con el WebSocket");
        wsRef.current?.send(period.toString());
      };

      wsRef.current.onmessage = (event) => {
        console.log("Mensaje recibido desde el WebSocket:", event.data);
        setWebsocketData(event.data);
      };

      wsRef.current.onclose = () => {
        console.log("Conexión cerrada con el WebSocket");
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [wssConn, period]);

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    event;
    if (reason === 'clickaway') {
      return;
    }
    setCorrectAPIKey(true);
    setcorrectUpdate(false);
};

  return(
    <>
      <CustomNavBar></CustomNavBar>
      <Box className = "container">
        <TextField  
          type="text"
          value={parseFloat(websocketData).toFixed(2)} 
          variant="standard"
          inputProps={{ readOnly: true }}
          className="textfield"
        />
        <FormControl className="select">
          <InputLabel id="period-select">Refresh Period</InputLabel>
          <Select
            labelId="select-period-label"
            id="select-period"
            value={period}
            label="Refresh Period"
            onChange={(e) => handlePeriodChange(Number(e.target.value))}
          >
            {
              selectItems.map( item => <MenuItem key={item.value} value={item.value} >{item.value}</MenuItem>)
            }
          </Select>
        </FormControl>
      </Box>
      <Snackbar
        open={!correctAPIKey}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error" sx={{width: '100%'}} > 
          "Wrong API-KEY"
        </Alert>
      </Snackbar>
      <Snackbar
        open={correctUpdate}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{width: '100%'}} > 
            "Refresh period change to: {period} seconds"
        </Alert>
      </Snackbar>
    </>
  )
}

export default App;
