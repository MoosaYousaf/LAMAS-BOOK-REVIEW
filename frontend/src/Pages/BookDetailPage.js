import React, {useState, useEffect} from 'react'
import { supabase } from '../Services/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

const BOOKS_INTO_DETAIL = [
  {
    id: '1',
    title: 'The Hate U Give',
    author: 'Angie Thomas',
    stars: '4.45',
    summary: "A young adult novel following a 16-year-old Starr Carter, who navigates between her poor neighborhood and an elite prep school. Her life changes when she witnesses the fatal police shooting of her unarmed childhood friend, Khalil. Starr must find her voice to testify against the officer, battling trauma and pressure from her community to speak up against injustice.",
    reviews: '80,133 reviews'
  }

  
  }
