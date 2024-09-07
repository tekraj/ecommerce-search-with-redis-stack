import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
    return <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:justify-between">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-lg font-bold mb-2">Company Name</h2>
                    <p className="text-sm">© 2024 Company Name. All rights reserved.</p>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="mb-4 md:mb-0 md:mr-8">
                        <h3 className="text-md font-semibold mb-2">Quick Links</h3>
                        <ul>
                            <li><Link className="text-gray-400 hover:text-white" to="#">Home</Link></li>
                            <li><Link className="text-gray-400 hover:text-white" to="#">About Us</Link></li>
                            <li><Link className="text-gray-400 hover:text-white" to="#">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-md font-semibold mb-2">Follow Us</h3>
                        <div className="flex space-x-4">
                            <Link className="text-gray-400 hover:text-white" to="#">
                                <i className="fab fa-facebook-f" /> Facebook
                            </Link>
                            <Link className="text-gray-400 hover:text-white" to="#">
                                <i className="fab fa-twitter" /> Twitter
                            </Link>
                            <Link className="text-gray-400 hover:text-white" to="#">
                                <i className="fab fa-instagram" /> Instagram
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
}

export default Footer;
