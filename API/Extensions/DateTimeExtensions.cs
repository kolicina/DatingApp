using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Extensions
{
    public static class DateTimeExtensions
    {
        public static int CalculateAge(this DateTime birth) {
            var today =DateTime.Today;
            var age =today.Year - birth.Year;
            if(birth.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}