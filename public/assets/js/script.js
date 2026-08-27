document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.dropdown');

    // 1. 모바일 햄버거 토글 버튼
    menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // 2. 대메뉴 클릭 시 서브메뉴 제어 (PC/모바일 공통으로 이동 막음)
    dropdowns.forEach(function (dropdown) {
        const toggleLink = dropdown.querySelector('.dropdown-toggle');

        toggleLink.addEventListener('click', function (e) {
            // 화면 크기 상관없이 무조건 링크 이동을 막고 드롭다운을 토글함
            e.preventDefault();
            e.stopPropagation();

            // 이미 열려있는 다른 서브메뉴 닫기
            dropdowns.forEach(function (item) {
                if (item !== dropdown) {
                    item.classList.remove('show');
                }
            });

            // 현재 메뉴 토글
            dropdown.classList.toggle('show');
        });
    });

    // 3. 외부 영역 클릭 시 메뉴 모두 닫기
    document.addEventListener('click', function () {
        dropdowns.forEach(function (item) {
            item.classList.remove('show');
        });
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});