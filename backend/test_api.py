import unittest
import json
import os
import sys

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Force SQLite for testing to prevent dropping active MySQL database
os.environ['DB_TYPE'] = 'sqlite'

from app import app
from database import db

class CBCApiTestCase(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_auth_workflow(self):
        """
        Verify registration, login, and jwt validation endpoints.
        """
        # 1. Register User (Checks Auto-Login token output)
        reg_payload = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        }
        res = self.client.post('/api/auth/register', 
                               data=json.dumps(reg_payload),
                               content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertIn('user', data)
        self.assertIn('token', data)  # Verify auto-login JWT token
        token = data['token']

        # 2. Retrieve Profile with JWT
        headers = {'Authorization': f'Bearer {token}'}
        res = self.client.get('/api/auth/profile', headers=headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['user']['name'], 'Test User')
        self.assertEqual(data['user']['reports_count'], 0) # No reports yet

        # 3. Update Profile details
        update_payload = {
            'name': 'Updated Name',
            'email': 'updated@example.com',
            'password': 'newpassword123'
        }
        res = self.client.put('/api/auth/profile',
                              data=json.dumps(update_payload),
                              content_type='application/json',
                              headers=headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['user']['name'], 'Updated Name')
        self.assertEqual(data['user']['email'], 'updated@example.com')
        self.assertIn('token', data)
        new_token = data['token']

        # 4. Verify login works with the new password
        login_payload = {
            'email': 'updated@example.com',
            'password': 'newpassword123'
        }
        res = self.client.post('/api/auth/login',
                               data=json.dumps(login_payload),
                               content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('token', data)

    def test_report_workflow(self):
        """
        Verify report creation, reading, filtering, aggregation, and deletion.
        """
        # Register and login first to get headers
        res = self.client.post('/api/auth/register', 
                               data=json.dumps({'name': 'Test', 'email': 'test@example.com', 'password': 'password'}),
                               content_type='application/json')
        token = json.loads(res.data)['token']
        headers = {'Authorization': f'Bearer {token}'}

        # 1. Create Report (Abnormal hemoglobin value)
        report_payload = {
            'hemoglobin': 10.5,
            'wbc': 6000,
            'platelets': 250000,
            'rbc': 4.8,
            'mcv': 90
        }
        res = self.client.post('/api/reports',
                               data=json.dumps(report_payload),
                               content_type='application/json',
                               headers=headers)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertIn('report', data)
        self.assertEqual(data['report']['hemoglobin'], 10.5)
        # Low hemoglobin adds 15 pts to risk score
        self.assertEqual(data['report']['risk_score'], 15)
        self.assertEqual(data['report']['health_score'], 85)
        self.assertEqual(data['report']['health_category'], "Good")
        self.assertIn('anemia', data['report']['summary'].lower())
        # Check that possible cause was evaluated
        self.assertIn('possible_cause', data['report']['analysis']['hemoglobin'])
        self.assertEqual(data['report']['analysis']['hemoglobin']['status'], 'Low')

        # 2. Get Reports List
        res = self.client.get('/api/reports', headers=headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(len(data['reports']), 1)
        report_id = data['reports'][0]['id']

        # 3. Retrieve Single Report Details
        res = self.client.get(f'/api/reports/{report_id}', headers=headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('analysis', data['report'])

        # 4. Get Dashboard Statistics
        res = self.client.get('/api/dashboard/stats', headers=headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['total_reports'], 1)
        self.assertEqual(data['report_statistics']['avg_hemoglobin'], 10.5)

        # 5. Delete Report
        res = self.client.delete(f'/api/reports/{report_id}', headers=headers)
        self.assertEqual(res.status_code, 200)

        # 6. Verify empty list after deletion
        res = self.client.get('/api/reports', headers=headers)
        data = json.loads(res.data)
        self.assertEqual(len(data['reports']), 0)

if __name__ == '__main__':
    unittest.main()
