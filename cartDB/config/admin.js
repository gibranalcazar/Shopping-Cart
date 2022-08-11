module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'ffcb28c3777ac7da82e559541a5c6db2'),
  },
});
