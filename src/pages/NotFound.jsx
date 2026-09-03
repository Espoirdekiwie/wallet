import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';
import { Card, Button } from '../components';

function NotFound() {
  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8 col-12 text-center">
          <Card>
            <div className="d-inline-flex p-3 rounded-circle mb-3 bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
              <FiAlertCircle className="fs-1" />
            </div>
            <h1 className="display-4 fw-900 text-gradient-orange mb-2">404</h1>
            <h4 className="fw-bold mb-2">Page Not Found</h4>
            <p className="text-muted small mb-4">
              The Web3 route or page you are looking for does not exist on this network.
            </p>
            <Link to="/" className="text-decoration-none">
              <Button variant="primary" size="md" icon={<FiHome />}>
                Return to Home
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
