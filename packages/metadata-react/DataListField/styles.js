import withStyles from '@material-ui/core/styles/withStyles';
import colors from '@material-ui/core/colors/common';

export default withStyles(theme => ({
  bold: {
    fontWeight: 'bold',
  },
  item: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit / 2,
    paddingBottom: theme.spacing.unit / 2,
  },
}));
