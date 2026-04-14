import React, {useState, useEffect} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const FEATURED_BOOKS = [
  {
    id: '1',
    title: 'The Hate U Give',
    author: 'Angie Thomas',
    summary:
