import { useState } from 'react';

// Types
export interface Student {
  regNo: string;
  name: string;
  email: string;
  phone: string;
  year: string;
  section: string;
}

// In-memory storage (replace with actual database/storage later)
let students: Student[] = [];

export const useStudentManagement = () => {
  const [studentList, setStudentList] = useState<Student[]>(students);

  const addStudents = (newStudents: Student[]) => {
    students = [...students, ...newStudents];
    setStudentList(students);
  };

  const getStudentsByYearAndSection = (year: string, section: string) => {
    return studentList.filter(
      student => student.year === year && student.section === section
    );
  };

  const processCSV = (csvText: string, year: string, section: string): { success: boolean; message: string } => {
    try {
      const rows = csvText.split('\n').filter(row => row.trim());
      if (rows.length === 0) {
        return { success: false, message: 'CSV file is empty' };
      }

      const headers = rows[0].toLowerCase().split(',').map(h => h.trim());
      const requiredHeaders = ['register number', 'student name', 'email', 'phone number'];
      
      const hasValidHeaders = requiredHeaders.every(header => 
        headers.some(h => h === header)
      );

      if (!hasValidHeaders) {
        return { 
          success: false, 
          message: 'Invalid CSV format. Required columns: Register Number, Student Name, Email, Phone Number'
        };
      }

      const newStudents: Student[] = [];
      const headerIndexMap = {
        regNo: headers.findIndex(h => h === 'register number'),
        name: headers.findIndex(h => h === 'student name'),
        email: headers.findIndex(h => h === 'email'),
        phone: headers.findIndex(h => h === 'phone number'),
      };

      // Process each row (skip header)
      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',').map(col => col.trim());
        
        if (columns.length >= 4) {
          newStudents.push({
            regNo: columns[headerIndexMap.regNo],
            name: columns[headerIndexMap.name],
            email: columns[headerIndexMap.email],
            phone: columns[headerIndexMap.phone],
            year,
            section
          });
        }
      }

      addStudents(newStudents);
      return { 
        success: true, 
        message: `Successfully added ${newStudents.length} students to Year ${year} Section ${section}` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error processing CSV file. Please check the format and try again.' 
      };
    }
  };

  return {
    studentList,
    addStudents,
    getStudentsByYearAndSection,
    processCSV
  };
};

export default useStudentManagement;