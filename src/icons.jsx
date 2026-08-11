// src/icons.jsx
// Todos os ícones do app importados individualmente (tree-shakeable)
// Isso substitui o uso de <span className="material-icons">nome</span>
// e elimina o carregamento da fonte de ícones completa (~1MB)

export { default as ArrowBackIcon } from '@mui/icons-material/ArrowBack';
export { default as DeleteIcon } from '@mui/icons-material/Delete';
export { default as CloseIcon } from '@mui/icons-material/Close';
export { default as LogoutIcon } from '@mui/icons-material/Logout';

// Uso nos componentes:
// import { ArrowBackIcon, DeleteIcon } from '../icons.jsx';
//
// Antes:  <span className="material-icons">arrow_back</span>
// Depois: <ArrowBackIcon sx={{ fontSize: '1.2rem' }} />
