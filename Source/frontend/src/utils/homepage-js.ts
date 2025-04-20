/**
 * 首頁動畫 JavaScript 代碼
 * 可供下載使用
 */

export const homepageJS = `// 監聽所有具有動畫類別的元素
document.addEventListener('DOMContentLoaded', function() {
  // 選擇所有帶有animate類的元素
  const animatedElements = document.querySelectorAll('.animate');
  
  // 創建觀察者對象
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 如果元素在視口中可見，添加visible類
        entry.target.classList.add('visible');
        // 元素可見後，停止觀察它
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 }); // 當10%的元素可見時觸發
  
  // 開始觀察每個元素
  animatedElements.forEach(element => {
    observer.observe(element);
  });
  
  // 平滑滾動導航
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // 為按鈕添加平滑滾動效果
  const scrollButtons = document.querySelectorAll('button[data-scroll]');
  scrollButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-scroll');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
`;
