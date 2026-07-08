import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, Chip, Avatar, CircularProgress } from "@mui/material";
import { AutoAwesome, CheckCircle, Security, InsertChartOutlined, MoreVert } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DashboardPage = () => {
  const [metrics, setMetrics] = useState({
    total_imputations: 0,
    avg_confidence: "0%",
    privacy_audits: "100%",
    imputations_per_day: [],
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/dashboard/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

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
                <Typography variant="h3" sx={{ fontWeight: 700 }}>{metrics.total_imputations}</Typography>
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
                <Typography variant="h3" sx={{ fontWeight: 700 }}>{metrics.avg_confidence}</Typography>
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
                <Typography variant="h3" sx={{ fontWeight: 700 }}>{metrics.privacy_audits}</Typography>
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
                  <BarChart data={metrics.imputations_per_day} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
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
                {metrics.recent_activity.length > 0 ? metrics.recent_activity.map((activity) => (
                  <Box key={activity.id} sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.light', width: 32, height: 32, fontSize: '0.875rem', fontWeight: 600 }}>
                      {activity.user ? activity.user.charAt(0) : '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{activity.user}</Typography>
                      <Typography variant="body2" color="text.secondary">{activity.action}</Typography>
                      <Typography variant="caption" color="text.disabled">{activity.time}</Typography>
                    </Box>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
                    No recent activity
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
