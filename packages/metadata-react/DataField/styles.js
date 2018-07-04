import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  formControl: {
    // marginLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    boxSizing: 'border-box',
    minWidth: 260,
  },
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  root: {
    outline: 'none'
  },
  suggestionsContainerOpen: {
    position: 'fixed',
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    zIndex: 3000,
  },
  suggestion: {
    padding: '4px 8px',
    whiteSpace: 'nowrap',
    //textOverflow: 'ellipsis',
  },
  suggestionSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)'
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: '#ddd'
  },
  bar: {
    minHeight: 48,
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
  },
  flex: {
    flex: 1,
    whiteSpace: 'nowrap',
  },
  a: {
    whiteSpace: 'nowrap',
    textDecoration: 'underline',
    textTransform: 'none',
    fontSize: 'inherit',
    cursor: 'pointer',
    color: '#0b0080'
  },
  icon: {
    width: 32,
    height: 32,
  }
});

export default withStyles(styles, {name: 'DataField'});
