import React, {useState, useEffect} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const FEATURED_BOOKS = [
  {
    id: '1',
    title: 'The Hate U Give',
    author: 'Angie Thomas',
    descripition: 'A young adult about 16-year-old Starr Carter, who navigates two worlds—her poor, Black neighborhood and a wealthy, white prep school—until she witnesses the fatal shooting of her unarmed best friend by a police officer, forcing her to find her voice and confront racism, police brutality, and activism.'
    price: '$11.99'
