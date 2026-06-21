import { Box, Typography, Grid, Card, CardContent, Chip, Avatar } from "@mui/material";
import { AutoAwesome, CheckCircle, Security, InsertChartOutlined, MoreVert } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Mon', imputations: 400 },
  { name: 'Tue', imputations: 300 },
  { name: 'Wed', imputations: 550 },
  { name: 'Thu', imputations: 480 },
  { name: 'Fri', imputations: 600 },
  { name: 'Sat', imputations: 200 },
  { name: 'Sun', imputations: 150 },
];

const recentActivity = [
  { id: 1, user: 'Dr. Felix', action: 'imputed 4 analytes for PT-10482', time: '12 min ago' },
  { id: 2, user: 'Rahmani Mohammed', action: 'ran a privacy audit on MIMIC-IV demo', time: '1 hour ago' },
  { id: 3, user: 'System', action: 'imported 50 new patient records', time: '3 hours ago' },
  { id: 4, user: 'Dr. Liam Schwartz', action: 'reviewed confident predictions for PT-10463', time: '5 hours ago' },
];

const DashboardPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 1 }}>Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of imputation metrics and system activity.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: 'primary.light', p: 1.5, borderRadius: 2, color: 'primary.dark' }}>
                <AutoAwesome />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Total Imputations</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>1,240</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: 'success.light', p: 1.5, borderRadius: 2, color: 'success.dark' }}>
                <CheckCircle />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Avg Confidence</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>94%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: 'info.light', p: 1.5, borderRadius: 2, color: 'info.dark' }}>
                <Security />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Privacy Audits Passed</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>100%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts & Activity */}
      <Grid container spacing={3}>
        {/* Main Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <InsertChartOutlined sx={{ mr: 1, color: 'primary.main' }} /> Imputations this week
                </Typography>
                <Chip label="Last 7 days" size="small" />
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="imputations" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <MoreVert sx={{ color: 'text.disabled' }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {recentActivity.map((activity) => (
                  <Box key={activity.id} sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.light', width: 32, height: 32, fontSize: '0.875rem', fontWeight: 600 }}>
                      {activity.user.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{activity.user}</Typography>
                      <Typography variant="body2" color="text.secondary">{activity.action}</Typography>
                      <Typography variant="caption" color="text.disabled">{activity.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
