import { useLoading } from '../contexts/LoadingContext';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

const GlobalLoader = () => {
  const { loading } = useLoading();

  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 100 }}
      open={loading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default GlobalLoader;
