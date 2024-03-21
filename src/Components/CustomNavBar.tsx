import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';


function CustomNavBar() {
    return (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="relative" color='transparent'>
            <Toolbar>
              <Typography variant="h6" component="div" color="black" sx={{ flexGrow: 1 }}>
                Sensing&Control
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
      );
}

export default CustomNavBar;