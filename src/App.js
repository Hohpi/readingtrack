// Reset daily tracking
const resetDailyTracking = () => {
    // Update start page for current book
    setCurrentBook(prev => ({
      ...prev, 
      startPage: prev.currentPage,
      goalPage: Math.min(prev.currentPage + pagesPerDay, prev.totalPages)
    }));
    
    // Reset daily counters
    setDailyPagesRead(0);
    setDailyAudioMinutes(0);
    setDailyGoalMet(false);
  };import React, { useState, useEffect } from 'react';

const ReadingTracker = () => {
  // Main state variables
  const [activeTab, setActiveTab] = useState('dashboard');
  const [daysLeft, setDaysLeft] = useState(0);
  const [readingSpeed, setReadingSpeed] = useState(250); // WPM
  const [wordsPerPage, setWordsPerPage] = useState(250);
  const [goalType, setGoalType] = useState('either');
  
  // Overall stats
  const [totalPages, setTotalPages] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);
  const [totalAudioHours, setTotalAudioHours] = useState(0);
  const [audioHoursListened, setAudioHoursListened] = useState(0);
  
  // Daily targets & tracking
  const [pagesPerDay, setPagesPerDay] = useState(0);
  const [audioMinutesPerDay, setAudioMinutesPerDay] = useState(0);
  const [dailyPagesRead, setDailyPagesRead] = useState(0);
  const [dailyAudioMinutes, setDailyAudioMinutes] = useState(0);
  const [dailyGoalMet, setDailyGoalMet] = useState(false);
  
  // Current book tracking
  const [currentBook, setCurrentBook] = useState({
    title: '',
    author: '',
    totalPages: 0,
    currentPage: 0,
    startPage: 0,
    goalPage: 0
  });
  
  // Book stacking (multiple books in progress)
  const [bookStack, setBookStack] = useState([]);
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  
  // Want to read list
  const [wantToReadList, setWantToReadList] = useState([]);

  // Load saved data on initial render
  useEffect(() => {
    // Calculate days remaining in the year
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysRemaining = Math.ceil((endOfYear - today) / msPerDay);
    setDaysLeft(daysRemaining);
    
    // Load data from localStorage
    const loadSavedData = () => {
      try {
        // Load main settings
        const savedSettings = localStorage.getItem('readingTrackerSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setReadingSpeed(settings.readingSpeed || 250);
          setWordsPerPage(settings.wordsPerPage || 250);
          setGoalType(settings.goalType || 'either');
        }
        
        // Load overall stats
        const savedStats = localStorage.getItem('readingTrackerStats');
        if (savedStats) {
          const stats = JSON.parse(savedStats);
          setTotalPages(stats.totalPages || 0);
          setPagesRead(stats.pagesRead || 0);
          setTotalAudioHours(stats.totalAudioHours || 0);
          setAudioHoursListened(stats.audioHoursListened || 0);
        }
        
        // Load daily tracking
        const savedDaily = localStorage.getItem('readingTrackerDaily');
        if (savedDaily) {
          const daily = JSON.parse(savedDaily);
          setDailyPagesRead(daily.dailyPagesRead || 0);
          setDailyAudioMinutes(daily.dailyAudioMinutes || 0);
          setDailyGoalMet(daily.dailyGoalMet || false);
        }
        
        // Load current book
        const savedCurrentBook = localStorage.getItem('readingTrackerCurrentBook');
        if (savedCurrentBook) {
          setCurrentBook(JSON.parse(savedCurrentBook));
        }
        
        // Load book stack
        const savedBookStack = localStorage.getItem('readingTrackerBookStack');
        if (savedBookStack) {
          setBookStack(JSON.parse(savedBookStack));
        }
        
        // Load want to read list
        const savedWantToRead = localStorage.getItem('readingTrackerWantToRead');
        if (savedWantToRead) {
          setWantToReadList(JSON.parse(savedWantToRead));
        }
        
        // Load active book index
        const savedActiveBookIndex = localStorage.getItem('readingTrackerActiveBookIndex');
        if (savedActiveBookIndex) {
          setActiveBookIndex(parseInt(savedActiveBookIndex) || 0);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    
    loadSavedData();
  }, []);
  
  // Save data whenever relevant state changes
  useEffect(() => {
    const saveData = () => {
      try {
        // Save settings
        localStorage.setItem('readingTrackerSettings', JSON.stringify({
          readingSpeed,
          wordsPerPage,
          goalType
        }));
        
        // Save overall stats
        localStorage.setItem('readingTrackerStats', JSON.stringify({
          totalPages,
          pagesRead,
          totalAudioHours,
          audioHoursListened
        }));
        
        // Save daily tracking
        localStorage.setItem('readingTrackerDaily', JSON.stringify({
          dailyPagesRead,
          dailyAudioMinutes,
          dailyGoalMet
        }));
        
        // Save current book
        localStorage.setItem('readingTrackerCurrentBook', JSON.stringify(currentBook));
        
        // Save book stack
        localStorage.setItem('readingTrackerBookStack', JSON.stringify(bookStack));
        
        // Save want to read list
        localStorage.setItem('readingTrackerWantToRead', JSON.stringify(wantToReadList));
        
        // Save active book index
        localStorage.setItem('readingTrackerActiveBookIndex', activeBookIndex.toString());
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    
    saveData();
  }, [
    readingSpeed, wordsPerPage, goalType,
    totalPages, pagesRead, totalAudioHours, audioHoursListened,
    dailyPagesRead, dailyAudioMinutes, dailyGoalMet,
    currentBook, bookStack, wantToReadList, activeBookIndex
  ]);
  
  // Calculate reading pace when inputs change
  useEffect(() => {
    if (daysLeft > 0) {
      // Physical books calculation
      if (totalPages >= pagesRead) {
        const remainingPages = totalPages - pagesRead;
        
        if (goalType === 'combined') {
          // Calculate combined reading goal by considering both formats
          const remainingAudioHours = totalAudioHours - audioHoursListened;
          const totalWordsRemaining = (remainingPages * wordsPerPage) + (remainingAudioHours * 60 * readingSpeed);
          const wordsPerDay = totalWordsRemaining / daysLeft;
          
          // Convert back to pages
          const adjustedPagesPerDay = Math.ceil(wordsPerDay / wordsPerPage);
          setPagesPerDay(adjustedPagesPerDay);
          
          // Audio time needed
          const adjustedAudioMinutes = Math.ceil(wordsPerDay / readingSpeed);
          setAudioMinutesPerDay(adjustedAudioMinutes);
        } else {
          // Independent goals
          const daily = Math.ceil(remainingPages / daysLeft);
          setPagesPerDay(daily);
        }
      }
      
      // Audiobooks calculation (only if not combined)
      if (goalType !== 'combined' && totalAudioHours >= audioHoursListened) {
        const remainingHours = totalAudioHours - audioHoursListened;
        const dailyMinutes = Math.ceil((remainingHours * 60) / daysLeft);
        setAudioMinutesPerDay(dailyMinutes);
      }
    }
  }, [totalPages, pagesRead, totalAudioHours, audioHoursListened, daysLeft, readingSpeed, wordsPerPage, goalType]);
  
  // Check if daily goal is met
  useEffect(() => {
    if (goalType === 'both') {
      setDailyGoalMet(dailyPagesRead >= pagesPerDay && dailyAudioMinutes >= audioMinutesPerDay);
    } else if (goalType === 'either') {
      setDailyGoalMet(dailyPagesRead >= pagesPerDay || dailyAudioMinutes >= audioMinutesPerDay);
    } else { // combined
      const pagesInWords = dailyPagesRead * wordsPerPage;
      const audioInWords = dailyAudioMinutes * readingSpeed;
      const totalWordsRead = pagesInWords + audioInWords;
      const targetWords = pagesPerDay * wordsPerPage; // or audioMinutesPerDay * readingSpeed - they're equivalent
      setDailyGoalMet(totalWordsRead >= targetWords);
    }
  }, [dailyPagesRead, dailyAudioMinutes, pagesPerDay, audioMinutesPerDay, goalType, wordsPerPage, readingSpeed]);
  
  // Update the current book's goal page based on daily target
  useEffect(() => {
    if (currentBook.startPage && currentBook.totalPages) {
      const newGoalPage = Math.min(
        currentBook.startPage + pagesPerDay,
        currentBook.totalPages
      );
      setCurrentBook(prev => ({...prev, goalPage: newGoalPage}));
    }
  }, [currentBook.startPage, currentBook.totalPages, pagesPerDay]);
  
  // Add a new book to Want to Read list
  const addToWantToRead = (newBook) => {
    setWantToReadList(prev => [...prev, newBook]);
  };
  
  // Move book from Want to Read to Book Stack
  const moveToBookStack = (index) => {
    const book = wantToReadList[index];
    setBookStack(prev => [...prev, {...book, currentPage: 0, startPage: 0, goalPage: 0}]);
    setWantToReadList(prev => prev.filter((_, i) => i !== index));
  };
  
  // Start reading a book (set as current book)
  const startReading = (index) => {
    const book = bookStack[index];
    setCurrentBook({
      ...book,
      startPage: book.currentPage,
      goalPage: Math.min(book.currentPage + pagesPerDay, book.totalPages)
    });
    setActiveBookIndex(index);
  };
  
  // Update current page for active book
  const updateCurrentPage = (newPage) => {
    // Make sure newPage is a number
    const pageNum = parseInt(newPage) || 0;
    
    // Update current book
    setCurrentBook(prev => ({...prev, currentPage: pageNum}));
    
    // Update in book stack
    const updatedStack = [...bookStack];
    if (updatedStack[activeBookIndex]) {
      updatedStack[activeBookIndex] = {...updatedStack[activeBookIndex], currentPage: pageNum};
      setBookStack(updatedStack);
    }
    
    // Update daily pages read
    const pagesReadToday = pageNum - currentBook.startPage;
    setDailyPagesRead(pagesReadToday > 0 ? pagesReadToday : 0);
    
    // Update total pages read
    if (pageNum > currentBook.currentPage) {
      const additionalPages = pageNum - currentBook.currentPage;
      setPagesRead(prev => prev + additionalPages);
    }
  };
  
  // Update daily audio minutes
  const updateDailyAudioMinutes = (minutes) => {
    // Make sure minutes is a number
    const mins = parseInt(minutes) || 0;
    setDailyAudioMinutes(mins);
    
    // Convert to hours and update total if greater than previous value
    if (mins > dailyAudioMinutes) {
      const additionalMinutes = mins - dailyAudioMinutes;
      const hoursListened = additionalMinutes / 60;
      setAudioHoursListened(prev => prev + hoursListened);
    }
  };
  
  // Move to next book in stack
  const moveToNextBook = () => {
    if (bookStack.length > 1) {
      const nextIndex = (activeBookIndex + 1) % bookStack.length;
      startReading(nextIndex);
    }
  };
  
  // Format time display
  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return hours === 1 ? `1 hour` : `${hours} hours`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = (current, total) => {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };
  
  // Calculate daily goal excess
  const calculateExcess = () => {
    if (goalType === 'both') {
      const pageExcess = dailyPagesRead - pagesPerDay;
      const audioExcess = dailyAudioMinutes - audioMinutesPerDay;
      return { pageExcess, audioExcess };
    } else if (goalType === 'either') {
      if (dailyPagesRead >= pagesPerDay) {
        return { pageExcess: dailyPagesRead - pagesPerDay, audioExcess: 0 };
      } else {
        return { pageExcess: 0, audioExcess: dailyAudioMinutes - audioMinutesPerDay };
      }
    } else { // combined
      const pagesInWords = dailyPagesRead * wordsPerPage;
      const audioInWords = dailyAudioMinutes * readingSpeed;
      const totalWordsRead = pagesInWords + audioInWords;
      const targetWords = pagesPerDay * wordsPerPage;
      const excessWords = totalWordsRead - targetWords;
      
      // Convert excess to both formats for display
      return {
        pageExcess: Math.round(excessWords / wordsPerPage),
        audioExcess: Math.round(excessWords / readingSpeed)
      };
    }
  };
  
  // Export data to JSON file
  const exportData = () => {
    try {
      // Collect all app data
      const exportData = {
        settings: {
          readingSpeed,
          wordsPerPage,
          goalType,
          daysLeft
        },
        stats: {
          totalPages,
          pagesRead,
          totalAudioHours,
          audioHoursListened
        },
        daily: {
          dailyPagesRead,
          dailyAudioMinutes,
          dailyGoalMet
        },
        currentBook,
        bookStack,
        wantToReadList,
        activeBookIndex
      };
      
      // Convert to JSON string
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Create blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary download link
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'reading-tracker-data.json';
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };
  
  // Import data from JSON file
  const importData = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // Validate data structure
          if (!importedData.settings || !importedData.stats || !importedData.bookStack) {
            throw new Error('Invalid data format');
          }
          
          // Apply imported data
          setReadingSpeed(importedData.settings.readingSpeed || 250);
          setWordsPerPage(importedData.settings.wordsPerPage || 250);
          setGoalType(importedData.settings.goalType || 'either');
          setDaysLeft(importedData.settings.daysLeft || daysLeft);
          
          setTotalPages(importedData.stats.totalPages || 0);
          setPagesRead(importedData.stats.pagesRead || 0);
          setTotalAudioHours(importedData.stats.totalAudioHours || 0);
          setAudioHoursListened(importedData.stats.audioHoursListened || 0);
          
          setDailyPagesRead(importedData.daily?.dailyPagesRead || 0);
          setDailyAudioMinutes(importedData.daily?.dailyAudioMinutes || 0);
          setDailyGoalMet(importedData.daily?.dailyGoalMet || false);
          
          setCurrentBook(importedData.currentBook || {
            title: '',
            author: '',
            totalPages: 0,
            currentPage: 0,
            startPage: 0,
            goalPage: 0
          });
          
          setBookStack(importedData.bookStack || []);
          setWantToReadList(importedData.wantToReadList || []);
          setActiveBookIndex(importedData.activeBookIndex || 0);
          
          alert('Data imported successfully!');
        } catch (parseError) {
          console.error('Error parsing imported data:', parseError);
          alert('Error importing data. The file may be corrupted or in an invalid format.');
        }
      };
      reader.readAsText(file);
      
      // Reset the input to allow importing the same file again
      event.target.value = '';
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data. Please try again.');
    }
  };
  
  // Calculate physical reading time
  const calculatePhysicalDailyTime = () => {
    return Math.round((pagesPerDay * wordsPerPage) / readingSpeed);
  };
  
  // Calculate physical reading time total
  const calculatePhysicalReadingTime = () => {
    const remainingPages = totalPages - pagesRead;
    const totalWords = remainingPages * wordsPerPage;
    const minutesNeeded = Math.round(totalWords / readingSpeed);
    return minutesNeeded;
  };
  
  // Calculate equivalent pages from audio time
  const calculateEquivalentPages = () => {
    const remainingAudioHours = totalAudioHours - audioHoursListened;
    const wordsInAudio = remainingAudioHours * 60 * readingSpeed;
    return Math.round(wordsInAudio / wordsPerPage);
  };
  
  // Calculate total time commitment per day
  const calculateTotalDailyTime = () => {
    if (goalType === 'both') {
      return calculatePhysicalDailyTime() + audioMinutesPerDay;
    } else if (goalType === 'either') {
      return Math.max(calculatePhysicalDailyTime(), audioMinutesPerDay);
    } else { // combined
      const totalWords = (totalPages - pagesRead) * wordsPerPage + ((totalAudioHours - audioHoursListened) * 60 * readingSpeed);
      return Math.ceil((totalWords / daysLeft) / readingSpeed);
    }
  };
  
  // Dashboard Component
  const DashboardTab = () => {
    const progress = calculateProgress(currentBook.currentPage, currentBook.totalPages);
    const bookProgress = calculateProgress(
      currentBook.currentPage - currentBook.startPage, 
      currentBook.goalPage - currentBook.startPage
    );
    const { pageExcess, audioExcess } = calculateExcess();
    
    return (
      <div>
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Daily Reading Goal</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Pages:</div>
              <div className="text-lg font-bold">{pagesPerDay} pages</div>
              <div className="text-xs text-gray-500">
                ({formatTime(Math.round((pagesPerDay * wordsPerPage) / readingSpeed))})
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Audio:</div>
              <div className="text-lg font-bold">{formatTime(audioMinutesPerDay)}</div>
              <div className="text-xs text-gray-500">
                (≈ {Math.round((audioMinutesPerDay * readingSpeed) / wordsPerPage)} pages)
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">Today's Progress:</div>
              <div className={`text-sm font-bold ${dailyGoalMet ? 'text-green-600' : 'text-gray-600'}`}>
                {dailyGoalMet ? '✅ Goal Met!' : 'In Progress...'}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs">
                  <span>Pages Read: {dailyPagesRead} / {pagesPerDay}</span>
                  {pageExcess > 0 && <span className="text-green-600">+{pageExcess} extra</span>}
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, (dailyPagesRead / pagesPerDay) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs">
                  <span>Audio: {formatTime(dailyAudioMinutes)} / {formatTime(audioMinutesPerDay)}</span>
                  {audioExcess > 0 && <span className="text-green-600">+{formatTime(audioExcess)} extra</span>}
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, (dailyAudioMinutes / audioMinutesPerDay) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={resetDailyTracking}
              className="mt-4 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Reset Daily Progress
            </button>
          </div>
        </div>
        
        {currentBook.title ? (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Currently Reading</h3>
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold">{currentBook.title}</h4>
                  <div className="text-sm text-gray-600">by {currentBook.author}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{currentBook.currentPage} / {currentBook.totalPages}</div>
                  <div className="text-sm text-gray-600">{progress}% complete</div>
                </div>
              </div>
              
              <div className="mt-3 mb-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-medium mb-1">Today's reading target:</div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Page {currentBook.startPage} → Page {currentBook.goalPage}</span>
                  <span>{bookProgress}% complete</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${bookProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Update current page:</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="0"
                      max={currentBook.totalPages}
                      value={currentBook.currentPage}
                      onChange={(e) => updateCurrentPage(e.target.value)}
                      className="w-20 px-2 py-1 border rounded"
                    />
                    <button 
                      onClick={() => updateCurrentPage(currentBook.currentPage + 1)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      +1
                    </button>
                  </div>
                </div>
                
                {bookStack.length > 1 && (
                  <button 
                    onClick={moveToNextBook}
                    className="px-3 py-1 mt-auto bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Next Book
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg mb-6">
            <p className="text-gray-500">No book currently active.</p>
            {bookStack.length > 0 && (
              <button 
                onClick={() => startReading(0)}
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Start Reading
              </button>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2">Audio Listening</h3>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <label className="block text-sm mb-1">Minutes listened today:</label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                value={dailyAudioMinutes}
                onChange={(e) => updateDailyAudioMinutes(e.target.value)}
                className="w-20 px-2 py-1 border rounded"
              />
              <button 
                onClick={() => updateDailyAudioMinutes(dailyAudioMinutes + 15)}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                +15min
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-3 bg-gray-50 rounded-md text-sm">
          <h4 className="font-medium mb-2">Reading Summary</h4>
          <ul className="space-y-2 text-gray-600">
            <li>Overall progress: {pagesRead}/{totalPages} pages ({calculateProgress(pagesRead, totalPages)}%)</li>
            <li>Audio progress: {audioHoursListened.toFixed(1)}/{totalAudioHours} hours ({calculateProgress(audioHoursListened, totalAudioHours)}%)</li>
            <li>Days remaining: {daysLeft}</li>
            <li>Books in stack: {bookStack.length}</li>
            <li>Want to read: {wantToReadList.length} books</li>
          </ul>
        </div>
      </div>
    );
  };
  
  // Book Stack Component
  const BookStackTab = () => {
    const [newBookTitle, setNewBookTitle] = useState('');
    const [newBookAuthor, setNewBookAuthor] = useState('');
    const [newBookPages, setNewBookPages] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    const addBookToStack = () => {
      if (newBookTitle && newBookPages) {
        const newBook = {
          title: newBookTitle,
          author: newBookAuthor || 'Unknown',
          totalPages: parseInt(newBookPages) || 0,
          currentPage: 0,
          startPage: 0,
          goalPage: 0
        };
        
        setBookStack(prev => [...prev, newBook]);
        setNewBookTitle('');
        setNewBookAuthor('');
        setNewBookPages('');
        setShowAddForm(false);
        
        // Update total pages
        setTotalPages(prev => prev + (parseInt(newBookPages) || 0));
      }
    };
    
    const removeFromStack = (index) => {
      const book = bookStack[index];
      setBookStack(prev => prev.filter((_, i) => i !== index));
      
      // Update total pages
      setTotalPages(prev => prev - book.totalPages);
      
      // If removing current book, reset current book
      if (index === activeBookIndex) {
        if (bookStack.length > 1) {
          const nextIndex = index === bookStack.length - 1 ? 0 : index;
          startReading(nextIndex);
        } else {
          setCurrentBook({
            title: '',
            author: '',
            totalPages: 0,
            currentPage: 0,
            startPage: 0,
            goalPage: 0
          });
        }
      }
    };
    
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Book Stack ({bookStack.length})</h3>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            {showAddForm ? 'Cancel' : 'Add Book'}
          </button>
        </div>
        
        {showAddForm && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-2">Add New Book</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Title:</label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Book title"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Author:</label>
                <input
                  type="text"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Total Pages:</label>
                <input
                  type="number"
                  min="1"
                  value={newBookPages}
                  onChange={(e) => setNewBookPages(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Number of pages"
                />
              </div>
              <button 
                onClick={addBookToStack}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
              >
                Add to Stack
              </button>
            </div>
          </div>
        )}
        
        {bookStack.length > 0 ? (
          <div className="space-y-4">
            {bookStack.map((book, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-3 ${index === activeBookIndex && currentBook.title ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{book.title}</h4>
                    <div className="text-sm text-gray-600">by {book.author}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{book.currentPage} / {book.totalPages}</div>
                    <div className="text-sm text-gray-600">
                      {calculateProgress(book.currentPage, book.totalPages)}% complete
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 mb-3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${calculateProgress(book.currentPage, book.totalPages)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {index !== activeBookIndex || !currentBook.title ? (
                    <button 
                      onClick={() => startReading(index)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      {book.currentPage > 0 ? 'Continue Reading' : 'Start Reading'}
                    </button>
                  ) : (
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                      Currently Reading
                    </div>
                  )}
                  
                  <button 
                    onClick={() => removeFromStack(index)}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Your book stack is empty.</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Your First Book
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Want to Read Component
  const WantToReadTab = () => {
    const [newBookTitle, setNewBookTitle] = useState('');
    const [newBookAuthor, setNewBookAuthor] = useState('');
    const [newBookPages, setNewBookPages] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    const addToWantToReadList = () => {
      if (newBookTitle && newBookPages) {
        const newBook = {
          title: newBookTitle,
          author: newBookAuthor || 'Unknown',
          totalPages: parseInt(newBookPages) || 0
        };
        
        setWantToReadList(prev => [...prev, newBook]);
        setNewBookTitle('');
        setNewBookAuthor('');
        setNewBookPages('');
        setShowAddForm(false);
      }
    };
    
    const removeFromList = (index) => {
      setWantToReadList(prev => prev.filter((_, i) => i !== index));
    };
    
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Want to Read ({wantToReadList.length})</h3>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            {showAddForm ? 'Cancel' : 'Add Book'}
          </button>
        </div>
        
        {showAddForm && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-2">Add Book to List</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Title:</label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Book title"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Author:</label>
                <input
                  type="text"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Total Pages:</label>
                <input
                  type="number"
                  min="1"
                  value={newBookPages}
                  onChange={(e) => setNewBookPages(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Number of pages"
                />
              </div>
              <button 
                onClick={addToWantToReadList}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
              >
                Add to List
              </button>
            </div>
          </div>
        )}
        
        {wantToReadList.length > 0 ? (
          <div className="space-y-3">
            {wantToReadList.map((book, index) => (
              <div key={index} className="border rounded-lg p-3 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{book.title}</h4>
                    <div className="text-sm text-gray-600">by {book.author}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{book.totalPages} pages</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <button 
                    onClick={() => moveToBookStack(index)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Move to Stack
                  </button>
                  
                  <button 
                    onClick={() => removeFromList(index)}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Your want-to-read list is empty.</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Your First Book
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Settings Component
  const SettingsTab = () => {
    const fileInputRef = React.useRef(null);
    
    const triggerFileInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    
    return (
      <div>
        <h3 className="font-bold text-lg mb-4">Settings</h3>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Import/Export Data</h4>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={exportData}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export Data
              </button>
              
              <button 
                onClick={triggerFileInput}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Import Data
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={importData}
                accept=".json"
                className="hidden"
              />
              <div className="text-xs text-gray-500 mt-1">
                Use Export/Import to transfer your reading data between devices
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Reading Parameters</h4>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Reading speed (words per minute):</label>
              <input
                type="number"
                min="100"
                step="10"
                value={readingSpeed}
                onChange={(e) => setReadingSpeed(parseInt(e.target.value) || 250)}
                className="w-full px-3 py-2 border rounded"
              />
              <span className="text-xs text-gray-500">Default: 250 WPM (average reading speed)</span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Words per page (average):</label>
              <input
                type="number"
                min="150"
                step="10"
                value={wordsPerPage}
                onChange={(e) => setWordsPerPage(parseInt(e.target.value) || 250)}
                className="w-full px-3 py-2 border rounded"
              />
              <span className="text-xs text-gray-500">Default: 250 words per page</span>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Goal Settings</h4>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Goal calculation:</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="either">Independent goals (reach either)</option>
                <option value="both">Reach both goals daily</option>
                <option value="combined">Combined goal (split between formats)</option>
              </select>
              <span className="text-xs text-gray-500 mt-1 block">
                This determines how your daily goals are calculated
              </span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Days left for goal:</label>
              <input
                type="number"
                min="1"
                value={daysLeft}
                onChange={(e) => setDaysLeft(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded"
              />
              <span className="text-xs text-gray-500">Default: Days remaining in current year</span>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Overall Reading Stats</h4>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Total pages across all books:</label>
              <input
                type="number"
                min="0"
                value={totalPages}
                onChange={(e) => setTotalPages(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded"
              />
              <span className="text-xs text-gray-500">
                This updates automatically when you add books to your stack
              </span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Pages already read:</label>
              <input
                type="number"
                min="0"
                max={totalPages}
                value={pagesRead}
                onChange={(e) => setPagesRead(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded"
              />
              <span className="text-xs text-gray-500">
                This updates automatically as you track your daily reading
              </span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Total hours of audiobooks:</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={totalAudioHours}
                onChange={(e) => setTotalAudioHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">Hours already listened:</label>
              <input
                type="number"
                min="0"
                step="0.1"
                max={totalAudioHours}
                value={audioHoursListened}
                onChange={(e) => setAudioHoursListened(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded"
              />
              <span className="text-xs text-gray-500">
                This updates automatically as you track your daily listening
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-center text-blue-600 mb-4">Reading Goal Tracker</h2>
      
      <div className="mb-4">
        <div className="flex border-b">
          <button 
            className={`px-4 py-2 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'bookStack' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('bookStack')}
          >
            Book Stack
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'wantToRead' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('wantToRead')}
          >
            Want to Read
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'settings' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </div>
      
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'bookStack' && <BookStackTab />}
      {activeTab === 'wantToRead' && <WantToReadTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
};

export default ReadingTracker;